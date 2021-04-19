import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import Table from "tables/agentsListTable";
import {
  serverSelected,
  agentsListUpdate,
  tornjakServerInfoUpdate,
  serverInfoUpdate
} from 'actions';

const Agent = props => (
  <tr>
    <td>{props.agent.id.trust_domain}</td>
    <td>{"spiffe://" + props.agent.id.trust_domain + props.agent.id.path}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.agent, null, ' ')}</pre>
    </div></td>

    <td>
      {/*
        // <Link to={"/agentView/"+props.agent._id}>view</Link> |
      */}
      <a href="#" onClick={() => { props.banAgent(props.agent.id) }}>ban</a>
      <br />
      <a href="#" onClick={() => { props.deleteAgent(props.agent.id) }}>delete</a>
    </td>
  </tr>
)

class AgentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.populateAgentsUpdate(this.props.globalServerSelected)
      }
    } else {
      this.populateLocalAgentsUpdate()
      this.populateLocalTornjakServerInfo();
      if(this.props.globalTornjakServerInfo !== "")
        console.log(this.props.globalTornjakServerInfo !== "")
        this.populateServerInfo();
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.populateAgentsUpdate(this.props.globalServerSelected)
      }
    }
  }

  populateLocalTornjakServerInfo() {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        this.props.tornjakServerInfoUpdate(response.data["serverinfo"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  populateServerInfo() {
    //node attestor plugin
    const nodeAttKeyWord = "NodeAttestor Plugin: ";
    var serverInfo = this.props.globalTornjakServerInfo;
    var nodeAttStrtInd = serverInfo.search(nodeAttKeyWord) + nodeAttKeyWord.length;
    var nodeAttEndInd = serverInfo.indexOf('\n', nodeAttStrtInd)
    var nodeAtt = serverInfo.substr(nodeAttStrtInd, nodeAttEndInd - nodeAttStrtInd)
    //server trust domain
    const trustDomainKeyWord = "\"TrustDomain\": \"";
    var trustDomainStrtInd = serverInfo.search(trustDomainKeyWord) + trustDomainKeyWord.length;
    var trustDomainEndInd = serverInfo.indexOf("\"", trustDomainStrtInd)
    var trustDomain = serverInfo.substr(trustDomainStrtInd, trustDomainEndInd - trustDomainStrtInd)
    var reqInfo = 
      {
        "data": 
          {
            "trustDomain": trustDomain,
            "nodeAttestorPlugin": nodeAtt
          }
      }
    this.props.serverInfoUpdate(reqInfo);
  }

  populateAgentsUpdate(serverName) {
    axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
      .then(response => {
        console.log(response);
        this.props.agentsListUpdate(response.data["agents"]);
      }).catch(error => {
        this.setState({
          message: "Error retrieving " + serverName + " : " + error.message
        });
        this.props.agentsListUpdate([]);
      });

  }

  populateLocalAgentsUpdate() {
    axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
      .then(response => {
        this.props.agentsListUpdate(response.data["agents"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  agentList() {
    if (typeof this.props.globalagentsList !== 'undefined') {
      return this.props.globalagentsList.map(currentAgent => {
        return <Agent key={currentAgent.id.path}
          agent={currentAgent}
          banAgent={this.banAgent}
          deleteAgent={this.deleteAgent} />;
      })
    } else {
      return ""
    }
  }
  render() {
    return (
      <div>
        <h3>Agent List</h3>
        <div className="alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
        </div>
        {IsManager}
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.agentList()} id="table-1" />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalagentsList: state.agents.globalagentsList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
})

export default connect(
  mapStateToProps,
  { serverSelected, agentsListUpdate, tornjakServerInfoUpdate, serverInfoUpdate }
)(AgentList)
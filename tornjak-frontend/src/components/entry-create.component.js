import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import 'carbon-components/css/carbon-components.min.css';
import { Dropdown } from 'carbon-components-react';
import { TextInput } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import './style.css';
import {
  serverSelected,
  selectorInfo,
  agentsListUpdate,
} from 'actions';

const items = [
  {
    id: 'option-1',
    label: 'Option 1',
  },
  {
    id: 'option-2',
    label: 'Option 2',
  },
  {
    id: 'option-3',
    label: 'Option 3',
  },
  {
    id: 'option-4',
    label: 'Option 4',
  },
];
class CreateEntry extends Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onChangeParentId = this.onChangeParentId.bind(this);
    this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
    this.setSelectorInfo = this.setSelectorInfo.bind(this);
    this.prepareParentIdAgentsList = this.prepareParentIdAgentsList.bind(this);

    //this.onChangeTtl = this.onChangeTtl.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: "",

      // spiffe_id
      spiffeId: "",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",

      // parent_id
      parentId: "",
      parentIdTrustDomain: "",
      parentIdPath: "",

      // ',' delimetered selectors
      selectors: "",
      adminFlag: false,

      //ttl: 500,
      //token: "",


      message: "",
      servers: [],
      selectedServer: "",
      agentsIdList: [],
      spiffeIdPrefix: "",
    }
  }

  componentDidMount() {
    this.setSelectorInfo();
    this.prepareParentIdAgentsList();
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    } else {
      // agent doesnt need to do anything
      this.setState({})
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    }
  }

  setSelectorInfo() {
    const selectors =
    {
      "gcp_iit": [
        {
          "selector": "gcp_iit:project-id"
        },
        {
          "selector": "gcp_iit:zone"
        },
        {
          "selector": "gcp_iit:instance-name"
        }
      ],
      "k8s_sat": [
        {
          "selector": "k8s_sat:cluster"
        },
        {
          "selector": "k8s_sat:agent_ns"
        },
        {
          "selector": "k8s_sat:agent_sa"
        }
      ],
      "k8s_psat": [
        {
          "selector": "k8s_psat:cluster"
        },
        {
          "selector": "k8s_psat:agent_ns"
        },
        {
          "selector": "k8s_psat:agent_sa"
        },
        {
          "selector": "k8s_psat:agent_pod_name"
        },
        {
          "selector": "k8s_psat:agent_pod_uid"
        },
        {
          "selector": "k8s_psat:agent_pod_label"
        },
        {
          "selector": "k8s_psat:agent_node_ip"
        },
        {
          "selector": "k8s_psat:agent_node_name"
        },
        {
          "selector": "k8s_psat:agent_node_uid"
        },
        {
          "selector": "k8s_psat:agent_node_label"
        }
      ],
    };
    this.props.selectorInfo(selectors)
  }

  prepareParentIdAgentsList() {
    var i = 0, prefix = "spiffe://";;
    let localAgentsIdList = [];
    //default option
    localAgentsIdList[0] = prefix + this.props.globalServerInfo.data.trustDomain + "/spire/server";
    //agents
    for (i = 0; i < this.props.globalagentsList.length; i++) {
      localAgentsIdList[i + 1] = prefix + this.props.globalagentsList[i].id.trust_domain + this.props.globalagentsList[i].id.path;
    }
    this.setState({
      agentsIdList: localAgentsIdList
    });
  }

  spiffeIdSelected = selected => {
    console.log(selected.selectedItem)
  }
  onChangeName(e) {
    this.setState({
      name: e.target.value
    });
  }

  onChangeTtl(e) {
    this.setState({
      ttl: Number(e.target.value)
    });
  }

  onChangeSelectors(e) {
    this.setState({
      selectors: e.target.value
    });
  }

  onChangeAdminFlag(e) {
    this.setState({
      adminFlag: e.target.checked,
    });
  }


  parseSpiffeId(sid) {
    if (sid.startsWith('spiffe://')) {
      var sub = sid.substr("spiffe://".length)
      var sp = sub.indexOf("/")
      if (sp > 0 && sp !== sub.length - 1) {
        var trustDomain = sub.substr(0, sp);
        var path = sub.substr(sp);
        return [true, trustDomain, path];
      }
    }
    return [false, "", ""];
  }

  onChangeSpiffeId(e) {
    var sid = e.target.value;
    console.log(sid)
    console.log(sid)
    if (sid.length === 0) {
      this.setState({
        spiffeId: sid,
        spiffeIdTrustDomain: "",
        spiffeIdPath: "",
        message: "",
      });
      return
    }

    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    if (validSpiffeId) {
      this.setState({
        message: "",
        spiffeId: sid,
        spiffeIdTrustDomain: trustDomain,
        spiffeIdPath: path,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      spiffeId: sid,
      message: "Invalid Spiffe ID",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",
    });
    return
  }

  onChangeParentId = selected => {
    var prefix = "spiffe://", sid = selected.selectedItem;
    if (sid.length === 0) {
      this.setState({
        parentId: sid,
        parentIdTrustDomain: "",
        parentIdPath: "",
        message: "",
      });
      return
    }
    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    var spiffeIdPrefix = prefix + trustDomain + "/";
    if (validSpiffeId) {
      this.setState({
        message: "",
        parentId: sid,
        parentIdTrustDomain: trustDomain,
        parentIdPath: path,
        spiffeIdPrefix: spiffeIdPrefix,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      parentId: sid,
      message: "Invalid Parent ID",
      parentIdTrustDomain: "",
      parentIdPath: "",
    });
    return
  }



  // Tag related things

  handleTagDelete(i) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleTagAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleTagDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  getApiEntryCreateEndpoint() {
    if (!IsManager) {
      return GetApiServerUri('/api/entry/create')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/entry/create') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const validSpiffeId = (this.parseSpiffeId(this.state.spiffeId))[0];
    if (!validSpiffeId) {
      this.setState({ message: "ERROR: invalid spiffe ID specified" });
      return
    }

    const validParentId = (this.parseSpiffeId(this.state.parentId))[0];
    if (!validParentId) {
      this.setState({ message: "ERROR: invalid parent ID specified" });
      return
    }

    const selectorStrings = this.state.selectors.split(',').map(x => x.trim())
    if (selectorStrings.length === 0) {
      this.setState({ message: "ERROR: Selectors cannot be empty" })
      return
    }
    const selectorEntries = selectorStrings.map(x => x.indexOf(":") > 0 ?
      {
        "type": x.substr(0, x.indexOf(":")),
        "value": x.substr(x.indexOf(":") + 1)
      } : null)

    if (selectorEntries.some(x => x == null || x["value"].length === 0)) {
      this.setState({ message: "ERROR: Selectors not in the correct format should be type:value" })
      return
    }

    var cjtData = {
      "entries": [{
        "spiffe_id": {
          "trust_domain": this.state.spiffeIdTrustDomain,
          "path": this.state.spiffeIdPath,
        },
        "parent_id": {
          "trust_domain": this.state.parentIdTrustDomain,
          "path": this.state.parentIdPath,
        },
        "selectors": selectorEntries,
        "admin": this.state.adminFlag,
      }]
    }

    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return
    }
    axios.post(endpoint, cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') }))
      .catch(err => this.setState({ message: "ERROR:" + err }))
    //window.location = '/';
  }

  render() {
    const ParentIdList = this.state.agentsIdList;
    return (
      <div>
        <h3>Create New Entry</h3>
        <form onSubmit={this.onSubmit}>
          <div className="alert-primary" role="alert">
            <pre>
              {this.state.message}
            </pre>
          </div>
          {IsManager}
          <br /><br />
          <div className="entry-form">
            <div className="parentId-drop-down">
              <Dropdown
                ariaLabel="Dropdown"
                id="carbon-dropdown-example"
                items={ParentIdList}
                label="Select Parent ID"
                titleText="Parent ID"
                //value={this.state.parentId}
                onChange={this.onChangeParentId}
              />
              <p className="parentId-helper">i.e. spiffe://example.org/agent/myagent1For node entries, specify spiffe server as parent i.e. spiffe://example.org/spire/server</p>
            </div>
            <div className="spiffeId-input-field">
              <TextInput
                helperText="i.e. spiffe://example.org/sample/spiffe/id"
                id="spiffeIdInputField"
                invalidText="A valid value is required"
                labelText="SPIFFE ID"
                placeholder="i.e. spiffe://example.org/sample/spiffe/id"
                //value={this.state.spiffeId}
                defaultValue={this.state.spiffeIdPrefix}
                onChange={(e)=>{
                  const input = e.target.value
                  e.target.value = this.state.spiffeIdPrefix + input.substr(this.state.spiffeIdPrefix.length);
                  this.onChangeSpiffeId(e);
                }}
                //onChange={this.onChangeSpiffeId}
              />
            </div>
            {/* <div className="form-group">
              <label>SPIFFE ID: i.e. spiffe://example.org/sample/spiffe/id</label>
              <input type="text"
                className="form-control"
                // ref={(target)=>{
                //   target.value = "hghg"
                // }}
                value={this.state.spiffeId}
                onChange={this.onChangeSpiffeId}
              /></div>

            <div className="form-group">
              <label>Parent ID: i.e. spiffe://example.org/agent/myagent1</label>
              <label>For node entries, specify spiffe server as parent i.e. spiffe://example.org/spire/server </label>
              <input type="text"
                className="form-control"
                //value={this.state.parentId}
                onChange={this.onChangeParentId}
              /></div> */}




            <div className="form-group">
              <label>Selectors: k8s_sat:cluster:demo-cluster,...</label>
              <input type="text"
                required
                className="form-control"
                value={this.state.token}
                onChange={this.onChangeSelectors}
              /></div>

            <div className="form-group">
              <input
                type="checkbox"
                checked={this.state.adminFlag}
                onChange={this.onChangeAdminFlag}
              />
              Admin Flag
            </div>




            <div className="form-group">
              <input type="submit" value="Create Entry" className="btn btn-primary" />
            </div>
            <div>TODO: Add other API fields</div>
          </div>
        </form>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalagentsList: state.agents.globalagentsList,
  globalServerInfo: state.servers.globalServerInfo,
})

export default connect(
  mapStateToProps,
  { serverSelected, selectorInfo, agentsListUpdate }
)(CreateEntry)
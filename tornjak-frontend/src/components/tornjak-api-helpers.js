import { Component } from 'react';
import axios from 'axios';
import GetApiServerUri from './helpers';

class TornjakApi extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.registerSelectors = this.registerSelectors.bind(this);
    this.registerLocalSelectors = this.registerLocalSelectors.bind(this);
    this.refreshSelectorsState = this.refreshSelectorsState.bind(this);
    this.refreshLocalSelectorsState = this.refreshLocalSelectorsState.bind(this);
    this.populateTornjakServerInfo = this.populateTornjakServerInfo.bind(this);
    this.populateLocalTornjakServerInfo = this.populateLocalTornjakServerInfo.bind(this);
    this.populateServerInfo = this.populateServerInfo.bind(this);
    this.populateAgentsUpdate = this.populateAgentsUpdate.bind(this);
    this.populateLocalAgentsUpdate = this.populateLocalAgentsUpdate.bind(this);
  }

  registerSelectors = (serverName, wLoadAttdata, refreshSelectorsState, agentworkloadSelectorInfoFunc) => {
    axios.post(GetApiServerUri('/manager-api/tornjak/selectors/register/') + serverName, wLoadAttdata)
      .then(res => {
        console.log(JSON.stringify(wLoadAttdata, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '));
        //this.setState({ message: "Requst:" + JSON.stringify(wLoadAttdata, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') });
        refreshSelectorsState(serverName, agentworkloadSelectorInfoFunc);
      }
      )
      .catch((error) => {
        console.log(error);
      })
  }

  registerLocalSelectors = (wLoadAttdata, refreshLocalSelectorsState, agentworkloadSelectorInfoFunc) => {
    axios.post(GetApiServerUri('/api/tornjak/selectors/register'), wLoadAttdata)
      .then(res => {
        console.log(JSON.stringify(wLoadAttdata, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '));
        //this.setState({ message: "Requst:" + JSON.stringify(wLoadAttdata, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') });
        refreshLocalSelectorsState(agentworkloadSelectorInfoFunc);
      }
      )
      .catch((error) => {
        console.log(error);
      })
  }
  //Function - Gets the list agent's with their workload plugin info for the selected server in manager mode
  //[
  // "agent1workloadselectorinfo": [
  //     {
  //       "id": "agentid",
  //       "spiffeid": "agentspiffeeid",  
  //       "selectors": "agentworkloadselectors"
  //     }
  //   ],
  //   "agent2workloadselectorinfo": [
  //     {
  //       "id": "agentid",
  //       "spiffeid": "agentspiffeeid",  
  //       "selectors": "agentworkloadselectors"  
  //     }
  //   ]
  //]
  refreshSelectorsState = (serverName, agentworkloadSelectorInfoFunc) => {
    axios.get(GetApiServerUri("/manager-api/tornjak/selectors/list/") + serverName, { crossdomain: true })
      .then(response => {
        console.log(response.data);
        agentworkloadSelectorInfoFunc(response.data["plugin"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }
  //Function - Gets the list agent's with their workload plugin info for the local server
  //[
  // "agent1workloadselectorinfo": [
  //     {
  //       "id": "agentid",
  //       "spiffeid": "agentspiffeeid",  
  //       "selectors": "agentworkloadselectors"
  //     }
  //   ],
  //   "agent2workloadselectorinfo": [
  //     {
  //       "id": "agentid",
  //       "spiffeid": "agentspiffeeid",  
  //       "selectors": "agentworkloadselectors"  
  //     }
  //   ]
  //]
  refreshLocalSelectorsState = (agentworkloadSelectorInfoFunc) => {
    axios.get(GetApiServerUri("/api/tornjak/selectors/list"), { crossdomain: true })
      .then(response => {
        console.log(response.data);
        agentworkloadSelectorInfoFunc(response.data["plugin"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }
  //Function - Sets the torjak server info of the selected server in manager mode
  populateTornjakServerInfo = (serverName, tornjakServerInfoUpdateFunc, tornjakMessegeFunc) => {
    axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
      .then(response => {
        tornjakServerInfoUpdateFunc(response.data);
        tornjakMessegeFunc(response.statusText);
      }).catch(error => {
        tornjakServerInfoUpdateFunc([]);
        tornjakMessegeFunc("Error retrieving " + serverName + " : " + error.message);
      });
  }

  //Function - Sets the torjak server info of the server in local mode
  populateLocalTornjakServerInfo = (tornjakServerInfoUpdateFunc, tornjakMessegeFunc) => {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        tornjakServerInfoUpdateFunc(response.data);
        tornjakMessegeFunc(response.statusText);
      })
      .catch((error) => {
        tornjakMessegeFunc("Error retrieving: " + error.message);
      })
  }

  //Function - Sets the server trust domain and nodeAttestorPlugin
  populateServerInfo = (serverInfo, serverInfoUpdateFunc) => {
    //node attestor plugin
    if (serverInfo === "" || serverInfo === undefined) {
      return
    }
    if (serverInfo.plugins["NodeAttestor"].length === 0) {
        return
    }
    let nodeAtt = serverInfo.plugins["NodeAttestor"][0];
    let trustDomain = serverInfo.trustDomain;
    var reqInfo =
    {
      "data":
      {
        "trustDomain": trustDomain,
        "nodeAttestorPlugin": nodeAtt
      }
    }
    serverInfoUpdateFunc(reqInfo);
  }

  //Function - Gets the list of agents with their info in manager mode for the selected server
  populateAgentsUpdate = (serverName, agentsListUpdateFunc, tornjakMessegeFunc) => {
    axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
      .then(response => {
        agentsListUpdateFunc(response.data["agents"]);
        tornjakMessegeFunc(response.statusText);
      }).catch(error => {
        agentsListUpdateFunc([]);
        tornjakMessegeFunc("Error retrieving " + serverName + " : " + error.message);
      });

  }

  //Function - Sets/ updates the list of agents with their info in Local mode for the server
  populateLocalAgentsUpdate = (agentsListUpdateFunc, tornjakMessegeFunc) => {
    axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
      .then(response => {
        agentsListUpdateFunc(response.data["agents"]);
        tornjakMessegeFunc(response.statusText);
      })
      .catch((error) => {
        tornjakMessegeFunc("Error retrieving: " + error.message);
      })
  }
}

export default TornjakApi;

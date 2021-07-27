import React from 'react';
import { connect } from 'react-redux';
import Link from '@material-ui/core/Link';
import Title from './title';
import { withStyles } from '@material-ui/core/styles';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import SpiffeEntryInterface from '../spiffe-entry-interface';

const columns = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "created", headerName: "Created", width: 300 },
  { field: "numNodes", headerName: "Number Of Nodes", width: 300},
  { field: "numEntries", headerName: "Number of Entries", width: 200}
];

function preventDefault(event) {
  event.preventDefault();
}

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class ClusterDashboardTable extends React.Component {
  constructor(props) {
    super(props);
    this.SpiffeEntryInterface = new SpiffeEntryInterface()
  }

  numberAgentEntries(spiffeid) {
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      var entriesList = this.props.globalEntries.globalEntriesList.filter(entry => {
        return spiffeid === (this.SpiffeEntryInterface.getEntryParentid(entry))
      })
      return entriesList.length
    } else {
      return 0
    }
  }

  numberClusterEntries(entry) {
    var entriesPerAgent = entry.agentsList.map(currentAgent => {
      return this.numberAgentEntries(currentAgent);
    })
    var sum = 0;
    for (let i = 0; i < entriesPerAgent.length; i++) {
      sum += entriesPerAgent[i]
    }
    return sum
  }

  cluster(entry) {
    return {
      id: entry.name,
      name: entry.name,
      created: entry.creationTime,
      numNodes: entry.agentsList.length,
      numEntries: this.numberClusterEntries(entry),
    }
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== 'undefined') {
      return this.props.globalClustersList.map(currentCluster => {
        return this.cluster(currentCluster);
      })
    } else {
      return []
    }
  }

  render() {
    const classes = this.props;
    var data = this.clusterList();
    return (
      <React.Fragment>
        <Title>Clusters</Title>
        <div style={{ height: 390, width: "100%" }}>
          <DataGrid 
            rows={data} 
            columns={columns} 
            pageSize={5} 
            checkboxSelection
            components={{
              Toolbar: GridToolbar,
            }}
             />
        </div>
        <div className={classes.seeMore}>
          <Link color="primary" href="#" onClick={preventDefault}>
            See more clusters
          </Link>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  globalClustersList: state.clusters.globalClustersList,
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(ClusterDashboardTable)
)

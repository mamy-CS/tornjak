import React from "react";
import { connect } from 'react-redux';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import Title from '../title';
import {
  Button,
} from '@material-ui/core';
import {
  clickedDashboardTabelFunc,
  selectedDashboardTableData
} from 'redux/actions';
import DashboardDetails from '../dashboard-details';

class TableDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      detailsLink: ""
    };
    this.detailsLink = this.detailsLink.bind(this);
  }

  detailsLink() {
    const { title } = this.props;
    if (this.state.selectedRows.length !== 0) {
      var detailsLink = "/tornjak/dashboard/details/" + title.toLowerCase() + "/" + this.state.selectedRows[0].name;
      console.log(detailsLink)
    }
    return detailsLink;
  }
  render() {
    const { numRows, data, columns, title } = this.props;
    return (
      <React.Fragment>
        <Title>
          <Button
            color="inherit"
            size="large"
            onClick={() => { this.props.clickedDashboardTabelFunc(title.toLowerCase()); }}
          >
            {title}
          </Button>
        </Title>
        <Button //Selected Details Button
          href={this.detailsLink()}
          style={{ width: 160, marginLeft: 1040, marginBottom: 20 }}
          color="primary"
          size="small"
          variant="outlined"
          onClick={() => {
            this.props.clickedDashboardTabelFunc(title.toLowerCase() + "details")
            this.props.selectedDashboardTableData(this.state.selectedRows)
            this.detailsLink();
            <DashboardDetails />
          }}
        >
          Selected Details
        </Button>
        <div style={{ width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={numRows}
            autoHeight={true}
            checkboxSelection
            onRowSelected={(selectedRows) => {
              selectedRows = Array.from(selectedRows.api.current.getSelectedRows(), ([name, value]) => ({ name, value }));
              this.setState({ selectedRows: selectedRows })
            }}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
  globalSelectedDashboardData: state.tornjak.globalSelectedDashboardData
})

export default connect(
  mapStateToProps,
  { clickedDashboardTabelFunc, selectedDashboardTableData }
)(TableDashboard);

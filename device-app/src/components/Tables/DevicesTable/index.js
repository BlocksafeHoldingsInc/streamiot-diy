import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { withStyles } from "@material-ui/core/styles/index";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import EditIcon from '@material-ui/icons/EditOutlined';

import EnhancedTableHead from '../EnhancedTableHead';
import ConfirmDialog from '../../Dialogs/ConfirmDialog';
import EditDeviceDialog from '../../Dialogs/EditDeviceDialog';
import { devices } from '../../../constants/index';

const styles = theme => ({
  root: {
    width: '100%',
  },
  actionIcon: {
    cursor: 'pointer',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
    fontWeight: 'bold',
  },
  backIconButton: {
    padding: 0,
    margin: '0 5px',
  },
  nextIconButton: {
    padding: 0,
    margin: '0 5px',
  },
  paginationSpacer: {
    display: 'none',
  },
  paginationToolBar: {
    justifyContent: 'center',
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

let counter = 0;
function createData(name, calories, fat, carbs, protein) {
  counter += 1;
  return { id: counter, name, calories, fat, carbs, protein };
}

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  { id: 'id', numeric: false, disablePadding: true, label: 'Device ID' },
  { id: 'name', numeric: false, disablePadding: true, label: 'Device Name' },
  { id: 'key', numeric: false, disablePadding: true, label: 'Device Key' },
  { id: 'type', numeric: false, disablePadding: true, label: 'Device Type' },
  { id: 'action', numeric: false, disabledPadding: true, label: 'Actions'},
];

class DevicesTable extends Component {
  state = {
    order: 'asc',
    orderBy: 'calories',
    selected: [],
    data: devices,
    page: 0,
    rowsPerPage: 5,
    deleteDeviceId: -1,
    deviceToEdit: null,
    isConfirmDialogOpen: false,
    isEditDialogOpen: false,
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleClickConfirmDelete = event => {
    this.props.onDeleteDevice(this.state.deleteDeviceId);
    this.setState({
      isConfirmDialogOpen: false,
      deleteDeviceId: -1,
    })
  }

  handleClickConfirmEdit = deviceName => {
    const { deviceToEdit } = this.state;
    const deviceId = (deviceToEdit || {}).id;
    const deviceType = (deviceToEdit || {}).type;

    this.setState({
      isEditDialogOpen: false,
      deviceToEdit: null,
    });

    this.props.editDevice(deviceId, {
      name: deviceName,
      type: deviceType,
    }).then(() => {
      this.props.getDevices()
    });
  }

  handleHideConfirmDialog = event => {
    this.setState({
      isConfirmDialogOpen: false,
      deleteDeviceId: -1,
    })
  }

  handleHideEditDialog = event => {
    this.setState({
      isEditDialogOpen: false,
      deviceToEdit: -1,
    })
  }

  handleClick = (event, deviceId) => {
    this.props.history.push(`/devices/${deviceId}`);
  };

  handleDeleteIconClick = deleteDeviceId => {
    this.setState({
      deleteDeviceId,
      isConfirmDialogOpen: true,
    });
  }

  handleEditIconClick = deviceToEdit => {
    this.setState({
      deviceToEdit,
      isEditDialogOpen: true,
    })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, data } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              rows={rows}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n.id);
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      onClick={event => this.handleClick(event, n.id)}
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.deviceId}
                      selected={isSelected}
                    >
                      <TableCell component="th" scope="row">{n.id}</TableCell>
                      <TableCell>{n.name}</TableCell>
                      <TableCell>{n.key}</TableCell>
                      <TableCell>{n.type}</TableCell>
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EditIcon
                          className={classes.actionIcon}
                          onClick={() => { this.handleEditIconClick(n) }}
                        />
                        <DeleteIcon
                          className={classes.actionIcon}
                          onClick={() => { this.handleDeleteIconClick(n.id) }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
            className: classes.backIconButton
          }}
          classes={{
            spacer: classes.paginationSpacer,
            toolbar: classes.paginationToolBar,
          }}
          labelRowsPerPage="Rows:"
          nextIconButtonProps={{
            'aria-label': 'Next Page',
            className: classes.nextIconButton,
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
        <ConfirmDialog
          contentText="Do you want to delete this device?"
          onClickConfirm={this.handleClickConfirmDelete}
          onClickDismiss={this.handleHideConfirmDialog}
          open={this.state.isConfirmDialogOpen}
          titleText="Confirm"
        />
        <EditDeviceDialog
          onClickConfirm={this.handleClickConfirmEdit}
          onClickDismiss={this.handleHideEditDialog}
          device={this.state.deviceToEdit}
          open={this.state.isEditDialogOpen}
          titleText="Edit Device"
        />
      </Paper>
    );
  }
}

DevicesTable.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(DevicesTable);

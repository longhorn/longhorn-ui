import React from 'react'
import { connect } from 'dva'
import { Row, Col, Icon } from 'antd'
import PropTypes from 'prop-types'
import SystemBackupsList from './systemBackupsList'
import SystemRestoresList from './systemRestoresList'
import SystemBackupsBulkAction from './systemBackupsBulkActions'
import SystemRestoresBulkAction from './systemRestoresBulkActions'
import style from './systemBackups.less'
import C from '../../utils/constants'
import CreateSystemBackup from './createSystemBackup'
import CreateSystemRestore from './createSystemRestore'
import { Filter } from '../../components/index'

class SystemBackups extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      systemBackupsHeight: 330,
      systemRestoresHeight: 300,
      selectedSystemBackupsRows: [],
      selectedSystemRestoresRows: [],
      createSystemBackupVisible: false,
      createSystemRestoreVisible: false,
      bulkCreateSystemRestore: false,
      createSystemBackupKey: Math.random(),
      createSystemRestoreKey: Math.random(),
    }
  }

  componentDidMount() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    const systemBackupsHeight = document.getElementById('systemBackupsTable').offsetHeight - C.ContainerMarginHeight - 60
    const systemRestoresHeight = document.getElementById('systemRestoresTable').offsetHeight - C.ContainerMarginHeight + 5
    this.setState({
      ...this.state,
      systemBackupsHeight,
      systemRestoresHeight,
    })
  }

  render() {
    const { loading, dispatch, location } = this.props
    const me = this
    let { systemBackupsData, systemRestoresData } = this.props.systemBackups

    const systemBackupsListProps = {
      dataSource: systemBackupsData,
      rowSelection: {
        selectedRowKeys: this.state.selectedSystemBackupsRows.map(item => item.id),
        onChange(_, records) {
          me.setState({
            ...me.state,
            selectedSystemBackupsRows: records,
          })
        },
      },
      height: this.state.systemBackupsHeight,
      loading,
      deleteSystemBackup(record) {
        dispatch({
          type: 'systemBackups/deleteSystemBackup',
          payload: record,
        })
      },
      createSystemRestore(record) {
        me.setState({
          ...me.state,
          createSystemRestoreVisible: true,
          bulkCreateSystemRestore: false,
          selectedSystemBackup: record,
        })
      },
    }

    const systemRestoresListProps = {
      dataSource: systemRestoresData,
      rowSelection: {
        selectedRowKeys: this.state.selectedSystemRestoresRows.map(item => item.id),
        onChange(_, records) {
          me.setState({
            ...me.state,
            selectedSystemRestoresRows: records,
          })
        },
      },
      height: this.state.systemRestoresHeight,
      loading,
      deleteSystemRestore(record) {
        dispatch({
          type: 'systemBackups/deleteSystemRestore',
          payload: record,
        })
      },
    }

    const SystemBackupsBulkActionProps = {
      selectedRows: this.state.selectedSystemBackupsRows,
      backupProps: this.props.backup,
      deleteSystemBackups() {
        dispatch({
          type: 'systemBackups/bulkDeleteSystemBackup',
          payload: { selectedRows: me.state.selectedSystemBackupsRows },
        })
      },
      createSystemBackup() {
        me.setState({
          ...me.state,
          createSystemBackupVisible: true,
        })
      },
    }

    const SystemRestoresBulkActionProps = {
      selectedRows: this.state.selectedSystemRestoresRows,
      deleteSystemRestores() {
        dispatch({
          type: 'systemBackups/bulkDeleteSystemRestore',
          payload: { selectedRows: me.state.selectedSystemRestoresRows },
        })
      },
    }

    const createSystemBackupModalProps = {
      item: {
        name: '',
      },
      visible: this.state.createSystemBackupVisible,
      onOk(newSystemBackup) {
        dispatch({
          type: 'systemBackups/createSystemBackup',
          payload: newSystemBackup,
          callback: () => {
            me.setState({
              ...me.state,
              createSystemBackupVisible: false,
            })
          },
        })
      },
      onCancel() {
        me.setState({
          ...me.state,
          createSystemBackupVisible: false,
        })
      },
    }

    let createSystemRestoreParams = {
      name: '',
      version: this.state.selectedSystemBackup?.version,
      systemBackup: this.state.selectedSystemBackup?.name,
    }

    if (this.state.bulkCreateSystemRestore) {
      createSystemRestoreParams = {
        name: '',
        version: this.state.selectedSystemBackupsRows?.length === 1 ? this.state.selectedSystemBackupsRows[0].version : '',
        systemBackup: this.state.selectedSystemBackupsRows?.length === 1 ? this.state.selectedSystemBackupsRows[0].name : '',
      }
    }

    const createSystemRestoreModalProps = {
      item: createSystemRestoreParams,
      visible: this.state.createSystemRestoreVisible,
      onOk(newSystemRestore) {
        dispatch({
          type: 'systemBackups/createSystemRestore',
          payload: newSystemRestore,
          callback: () => {
            me.setState({
              ...me.state,
              createSystemRestoreVisible: false,
              bulkCreateSystemRestore: false,
            })
          },
        })
      },
      onCancel() {
        me.setState({
          ...me.state,
          createSystemRestoreVisible: false,
          bulkCreateSystemRestore: false,
        })
      },
    }

    const systemBackupsFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'state', name: 'State' },
        { value: 'version', name: 'Version' },
      ],
      onSearch(filter) {
        dispatch({
          type: 'systemBackups/systemBackupsfilter',
          payload: filter,
        })
      },
    }

    const systemRestoresFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'state', name: 'State' },
        { value: 'version', name: 'Version' },
      ],
      onSearch(filter) {
        dispatch({
          type: 'systemBackups/systemRestoresfilter',
          payload: filter,
        })
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', padding: 0, flexDirection: 'column', overflow: 'visible !important' }}>
        <div id="systemBackupsTable" style={{ height: '43%', padding: '8px 12px 0px' }}>
          <Row gutter={24}>
            <Col lg={17} md={15} sm={24} xs={24}>
              <SystemBackupsBulkAction {...SystemBackupsBulkActionProps} />
            </Col>
            <Col lg={7} md={9} sm={24} xs={24}>
              <Filter {...systemBackupsFilterProps} />
            </Col>
          </Row>
          <SystemBackupsList {...systemBackupsListProps} />
        </div>
        <div className={style.systemRestores}>
          <Icon type="file-done" />
          <span style={{ marginLeft: '4px' }}>System Restore</span>
        </div>
        <div id="systemRestoresTable" style={{ height: '43%', padding: '8px 12px 0px' }}>
          <Row gutter={24}>
            <Col lg={17} md={15} sm={24} xs={24}>
              <SystemRestoresBulkAction {...SystemRestoresBulkActionProps} />
            </Col>
            <Col lg={7} md={9} sm={24} xs={24}>
              <Filter {...systemRestoresFilterProps} />
            </Col>
          </Row>
          <SystemRestoresList {...systemRestoresListProps} />
        </div>
        { this.state.createSystemBackupVisible && <CreateSystemBackup {...createSystemBackupModalProps} key={this.state.createSystemBackupKey} />}
        { this.state.createSystemRestoreVisible && <CreateSystemRestore {...createSystemRestoreModalProps} key={this.state.createSystemRestoreKey} />}
      </div>
    )
  }
}

SystemBackups.propTypes = {
  loading: PropTypes.bool,
  dispatch: PropTypes.func,
  systemBackups: PropTypes.object,
  backup: PropTypes.object,
  location: PropTypes.object,
}

export default connect(({ systemBackups, backup, loading }) => ({ systemBackups, backup, loading: loading.models.systemBackups }))(SystemBackups)

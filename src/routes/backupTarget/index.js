import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import { Filter } from '../../components/index'
import { Row, Col, Button } from 'antd'
import CreateBackupTargetModal from './CreateBackupTargetModal'
import EditBackupTargetModal from './EditBackupTargetModal'
import BackupTargetList from './BackupTargetList'
import BackupTargetBulkActions from './BackupTargetBulkActions'
import { timeDurationStrToInt } from '../../utils/formatter'
import queryString from 'query-string'
import C from '../../utils/constants'

const filterDataByField = (backupTargetData, field, value) => {
  if (!field) {
    return backupTargetData
  }
  let result = backupTargetData
  switch (field) {
    case 'name':
    case 'backupTargetURL':
    case 'credentialSecret':
    case 'pollInterval':
      result = backupTargetData.filter((d) => (value ? d[`${field}`].includes(value?.trim()) : true))
      break
    case 'available': {
      result = backupTargetData.filter((d) => {
        if (value === 'available') return d[`${field}`] === true
        if (value === 'error') return d[`${field}`] === false
        return true
      })
      break
    }
    default:
      break
  }
  return result
}

class BackupTarget extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      createBackupTargetModalVisible: false,
      editBackupTargetModalVisible: false,
      selectedEditRow: {},
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
    const table = document.getElementById('backupTargetTable')
    if (table) {
      const height = table.offsetHeight - C.ContainerMarginHeight
      this.setState({
        height,
      })
    }
  }

  handleEditClick = (record) => {
    this.setState({
      ...this.state,
      selectedEditRow: record,
      editBackupTargetModalVisible: true,
    })
  }

  handleEditModalClose = () => {
    this.setState({ ...this.state, editBackupTargetModalVisible: false })
  }


  handleCreateModalClose = () => {
    this.setState({ ...this.state, createBackupTargetModalVisible: false })
  }

  handleCreateModalOpen = () => {
    this.setState({ ...this.state, createBackupTargetModalVisible: true })
  }

  render() {
    const { dispatch, loading, location } = this.props
    const { createBackupTargetModalVisible, editBackupTargetModalVisible, selectedEditRow } = this.state
    const { data, selectedRows } = this.props.backupTarget
    const { field, value } = queryString.parse(this.props.location.search)

    const backupTargetData = filterDataByField(data, field, value)

    const backupTargetListProps = {
      dataSource: backupTargetData,
      height: this.state.height,
      loading,
      rowSelection: {
        selectedRowKeys: selectedRows.map(item => item.id),
        onChange(_, records) {
          dispatch({
            type: 'backupTarget/changeSelection',
            payload: {
              selectedRows: records,
            },
          })
        },
      },
      deleteBackupTarget: (record) => {
        dispatch({
          type: 'backupTarget/delete',
          payload: record,
        })
      },
      editBackupTarget: (record) => {
        this.handleEditClick(record)
      },
    }

    const createBackupTargetModalProps = {
      item: {
        name: '',
        backupTargetURL: '',
        credentialSecret: '',
        pollInterval: 300,
        readOnly: false,
        default: false,
      },
      allBackupTargetsName: backupTargetData.map(item => item.name),
      visible: createBackupTargetModalVisible,
      onOk: (newBackupTarget) => {
        dispatch({
          type: 'backupTarget/create',
          payload: newBackupTarget,
        })
        this.handleCreateModalClose()
      },
      onCancel: () => this.handleCreateModalClose(),
    }

    const editBackupTargetModalProps = {
      item: {
        ...selectedEditRow,
        pollInterval: timeDurationStrToInt(selectedEditRow.pollInterval),
      },
      visible: editBackupTargetModalVisible,
      onOk: (updatedBackupTarget) => {
        dispatch({
          type: 'backupTarget/edit',
          payload: updatedBackupTarget,
        })
        this.handleEditModalClose()
      },
      onCancel: () => this.handleEditModalClose(),
    }

    const backupTargetBulkActionsProps = {
      selectedRows,
      bulkDeleteBackupTargets(records) {
        dispatch({
          type: 'backupTarget/bulkDelete',
          payload: records,
        })
      },
    }

    const backupTargetFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'backupTargetURL', name: 'URL' },
        { value: 'credentialSecret', name: 'Credential Secret' },
        { value: 'pollInterval', name: 'Poll Interval' },
        { value: 'available', name: 'Status' },
      ],
      availableOption: [
        { value: 'available', name: 'Available' },
        { value: 'error', name: 'Error' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        if (filterField && filterValue) {
          const queryStringObj = { field: filterField }
          if (['name', 'backupTargetURL', 'credentialSecret', 'pollInterval', 'available'].includes(filterField) && filterValue) {
            queryStringObj.value = filterValue
          }
          dispatch(routerRedux.push({
            pathname: '/backupTarget',
            search: queryString.stringify(queryStringObj),
          }))
        } else {
          dispatch(routerRedux.push({
            pathname: '/backupTarget',
            search: queryString.stringify({}),
          }))
        }
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24} style={{ marginBottom: 8 }}>
          <Col lg={{ span: 4 }} md={{ span: 6 }} sm={24} xs={24}>
            <BackupTargetBulkActions {...backupTargetBulkActionsProps} />
          </Col>
          <Col lg={{ offset: 13, span: 7 }} md={{ offset: 8, span: 10 }} sm={24} xs={24}>
            <Filter {...backupTargetFilterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" disabled={loading} onClick={() => this.handleCreateModalOpen()}>
          Create Backup Target
        </Button>
        <BackupTargetList {...backupTargetListProps} />
        {createBackupTargetModalVisible && <CreateBackupTargetModal {...createBackupTargetModalProps} />}
        {editBackupTargetModalVisible && <EditBackupTargetModal {...editBackupTargetModalProps} />}
      </div>
    )
  }
}

BackupTarget.propTypes = {
  app: PropTypes.object,
  backupTarget: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ app, backupTarget, loading }) => ({ app, backupTarget, loading: loading.models.backupTarget }))(BackupTarget)

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Button } from 'antd'
import { routerRedux } from 'dva/router'
import queryString from 'query-string'
import { Filter } from '../../components/index'
import CreateSnapshotGroupModal from './CreateSnapshotGroupModal'
import SnapshotGroupList from './SnapshotGroupList'
import SnapshotGroupBulkActions from './SnapshotGroupBulkActions'
import C from '../../utils/constants'

const filterDataByField = (data, field, value) => {
  if (!field || !value) {
    return data
  }
  switch (field) {
    case 'name':
      return data.filter((d) => d.name && d.name.includes(value.trim()))
    case 'status':
      return data.filter((d) => {
        const phase = d.degraded ? 'Degraded' : (d.status?.phase || d.phase)
        return phase === value
      })
    default:
      return data
  }
}

class SnapshotGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      createItem: {},
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
    const table = document.getElementById('snapshotGroupTable')
    if (table) {
      this.setState({ height: table.offsetHeight - C.ContainerMarginHeight })
    }
  }

  handleCreateOpen = (createItem = {}) => {
    this.setState({ createItem })
    this.props.dispatch({ type: 'snapshotGroup/showCreateModal' })
  }

  render() {
    const { dispatch, loading, location, snapshotGroup, volume } = this.props
    const {
      data, selectedRows, createModalVisible, createModalKey, createModalError, previewData, previewLoading,
    } = snapshotGroup
    const { field, value } = queryString.parse(location.search)
    const listData = filterDataByField(data, field, value)
    const volumeOptions = (volume?.data || []).map(item => item.name)

    const listProps = {
      dataSource: listData,
      height: this.state.height,
      loading,
      rowSelection: {
        selectedRowKeys: selectedRows.map(item => item.name),
        onChange(_, records) {
          dispatch({ type: 'snapshotGroup/changeSelection', payload: { selectedRows: records } })
        },
      },
      deleteSnapshotGroup: (record) => {
        dispatch({ type: 'snapshotGroup/delete', payload: record })
      },
      recreateSnapshotGroup: (record) => {
        this.handleCreateOpen({
          volumes: record.spec?.volumes || record.volumes,
          volumeSelector: record.spec?.volumeSelector || record.volumeSelector,
          labels: record.spec?.labels || record.labels,
          deadlineSeconds: record.spec?.deadlineSeconds || record.deadlineSeconds,
        })
      },
    }

    const createModalProps = {
      key: createModalKey,
      item: this.state.createItem,
      visible: createModalVisible,
      volumeOptions,
      previewData,
      previewLoading,
      errorMessage: createModalError,
      onCancel() {
        dispatch({ type: 'snapshotGroup/hideCreateModal' })
      },
      onOk(payload) {
        dispatch({ type: 'snapshotGroup/create', payload })
      },
      onPreview(payload) {
        dispatch({ type: 'snapshotGroup/preview', payload })
      },
      onClearPreview() {
        dispatch({ type: 'snapshotGroup/setPreviewData', payload: [] })
      },
    }

    const bulkActionsProps = {
      selectedRows,
      bulkDeleteSnapshotGroups(records) {
        dispatch({ type: 'snapshotGroup/bulkDelete', payload: records })
      },
    }

    const filterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'status', name: 'Status' },
      ],
      stateOption: [
        { value: 'InProgress', name: 'InProgress' },
        { value: 'Ready', name: 'Ready' },
        { value: 'Failed', name: 'Failed' },
        { value: 'Degraded', name: 'Degraded' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue, stateValue } = filter
        const keyword = filterField === 'status' ? stateValue : filterValue
        if (filterField && keyword) {
          dispatch(routerRedux.push({
            pathname: '/snapshotGroup',
            search: queryString.stringify({ field: filterField, value: keyword }),
          }))
        } else {
          dispatch(routerRedux.push({ pathname: '/snapshotGroup' }))
        }
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24} style={{ marginBottom: 8 }}>
          <Col lg={{ span: 4 }} md={{ span: 6 }} sm={24} xs={24}>
            <SnapshotGroupBulkActions {...bulkActionsProps} />
          </Col>
          <Col lg={{ offset: 13, span: 7 }} md={{ offset: 8, span: 10 }} sm={24} xs={24}>
            <Filter {...filterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" disabled={loading} onClick={() => this.handleCreateOpen({})}>
          Create Snapshot Group
        </Button>
        <SnapshotGroupList {...listProps} />
        {createModalVisible && <CreateSnapshotGroupModal {...createModalProps} />}
      </div>
    )
  }
}

SnapshotGroup.propTypes = {
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  location: PropTypes.object,
  snapshotGroup: PropTypes.object,
  volume: PropTypes.object,
}

export default connect(({ snapshotGroup, volume, loading }) => ({
  snapshotGroup,
  volume,
  loading: loading.models.snapshotGroup,
}))(SnapshotGroup)

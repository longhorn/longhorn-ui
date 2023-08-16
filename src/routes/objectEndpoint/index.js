import React from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Button } from 'antd'
import { Filter } from '../../components/index'
import CreateObjectEndpoint from './CreateObjectEndpoint'
import EditObjectEndpoint from './EditObjectEndpoint'
import ObjectEndpointList from './ObjectEndpointList'
import ObjectEndpointBulkActions from './ObjectEndpointBulkActions'

class ObjectEndpoint extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      selectedRows: [],
      createObjectEndpointModalVisible: false,
      createObjectEndpointModalKey: Math.random(),
      editObjectEndpointModalVisible: false,
      editObjectEndpointModalKey: Math.random(),
    }
  }

  showCreateObjectEndpointModal = () => {
    this.setState({
      ...this.state,
      selected: {},
      createObjectEndpointModalVisible: true,
      createObjectEndpointModalKey: Math.random(),
    })
  }

  showEditObjectEndpointModal = () => {
    this.setState({
      ...this.state,
      editObjectEndpointModalVisible: true,
      editObjectEndpointModalKey: Math.random(),
    })
  }

  render() {
    const me = this
    const { dispatch, loading, location } = this.props
    const { data, storageclasses } = this.props.objectEndpoint
    const { field, value } = queryString.parse(this.props.location.search)

    let objectendpoints = data.filter((item) => {
      if (field === 'name') {
        return item[field] && item[field].indexOf(value.trim()) > -1
      }
      return true
    })

    if (objectendpoints && objectendpoints.length > 0) {
      objectendpoints.sort((a, b) => a.name.localeCompare(b.name))
    }

    const createObjectEndpointModalProps = {
      item: {
        storageclasses,
        accesskey: Math.random().toString(36).substr(2, 6),
        secretkey: Math.random().toString(36).substr(2, 6),
      },
      visible: this.state.createObjectEndpointModalVisible,
      onCancel() {
        me.setState({
          ...me.state,
          createObjectEndpointModalVisible: false,
        })
      },
      onOk(newObjectEndpoint) {
        me.setState({
          ...me.state,
          createObjectEndpointModalVisible: false,
        })
        dispatch({
          type: 'objectEndpoint/create',
          payload: newObjectEndpoint,
        })
      },
    }

    const editObjectEndpointModalProps = {
      selected: {},
      visible: this.state.editObjectEndpointModalVisible,
      onCancel() {
        me.setState({
          ...me.state,
          editObjectEndpointModalVisible: false,
        })
      },
      onOk(record) {
        me.setState({
          ...me.state,
          editObjectEndpointModalVisible: false,
        })
        dispatch({
          type: 'objectEndpoint/update',
          payload: record,
        })
      },
    }

    const objectEndpointListProps = {
      dataSource: objectendpoints,
      height: this.state.height,
      loading,
      rowSelection: {
        selectedRowKeys: this.state.selectedRows.map(item => item.name),
        onChange(_, records) {
          me.setState({
            ...me.state,
            selectedRows: records,
          })
        },
      },
      editObjectEndpoint: this.showEditObjectEndpointModal,
      deleteObjectEndpoint(record) {
        dispatch({
          type: 'objectEndpoint/delete',
          payload: record,
        })
      },
    }

    const objectEndpointFilterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        filterField && filterValue ? dispatch(routerRedux.push({
          pathname: '/objectEndpoint',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/objectEndpoint',
          search: queryString.stringify({}),
        }))
      },
    }

    const objectEndpointBulkActionsProps = {
      selectedRows: this.state.selectedRows,
      deleteObjectEndpoint(record) {
        dispatch({
          type: 'objectEndpoint/bulkDelete',
          payload: record,
          callback: () => {
            me.setState({
              ...this.state,
              selectedRows: [],
            })
          },
        })
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24} className="filter-input">
          <Col lg={{ span: 4 }} md={{ span: 6 }} sm={24} xs={24}>
            <ObjectEndpointBulkActions {...objectEndpointBulkActionsProps} />
          </Col>
          <Col lg={{ offset: 13, span: 7 }} md={{ offset: 8, span: 10 }} sm={24} xs={24}>
            <Filter {...objectEndpointFilterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" onClick={this.showCreateObjectEndpointModal}>Create Object Endpoint</Button>
        {this.state.createObjectEndpointModalVisible && <CreateObjectEndpoint key={this.createObjectEndpointModalKey} {...createObjectEndpointModalProps} />}
        {this.state.editObjectEndpointModalVisible && <EditObjectEndpoint key={this.editObjectEndpointModalKey} {...editObjectEndpointModalProps} />}
        <ObjectEndpointList {...objectEndpointListProps} />
      </div>
    )
  }
}

ObjectEndpoint.propTypes = {
  objectEndpoint: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(
  ({ objectEndpoint, loading }) => ({ objectEndpoint, loading: loading.models.objectEndpoint })
)(ObjectEndpoint)

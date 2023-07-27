import React from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import { connect } from 'dva'
import { Row, Col, Button } from 'antd'
import { Filter } from '../../components/index'
import CreateObjectEndpoint from './CreateObjectEndpoint'
import ObjectEndpointList from './ObjectEndpointList'
import ObjectEndpointBulkActions from './ObjectEndpointBulkActions'

class ObjectEndpoint extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRows: [],
      createObjectEndpointModalVisible: false,
      createObjectEndpointModalKey: Math.random(),
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

  render() {
    const me = this
    const { dispatch, loading, location } = this.props
    const { data } = this.props.objectendpoint
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
      item: {},
      visible: this.state.createObjectEndpointModalVisible,
      onCancel() {
        me.setState({
          ...this.state,
          createObjectEndpointModalVisible: false,
        })
      },
    }

    const objectEndpointListProps = {
      dataSource: objectendpoints,
      height: this.state.height,
      loading,
      rowSelection: {
        selectedRowKeys: this.state.selectedRows.map(item => item.id),
        onChange(_, records) {
          me.setState({
            ...me.state,
            selectedRows: records,
          })
        },
      },
    }

    const objectEndpointFilterProps = {
      location,
      fieldOption: [],
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
        <ObjectEndpointList {...objectEndpointListProps} />
      </div>
    )
  }
}

ObjectEndpoint.propTypes = {
  objectendpoint: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(
  ({ objectendpoint, loading }) => ({ objectendpoint, loading: loading.models.objectEndpoint })
)(ObjectEndpoint)

import React from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Button } from 'antd'
import { Filter } from '../../components/index'
import CreateObjectStore from './CreateObjectStore'
import EditObjectStore from './EditObjectStore'
import ObjectStoreList from './ObjectStoreList'
import ObjectStoreBulkActions from './ObjectStoreBulkActions'

// See https://docs.aws.amazon.com/IAM/latest/APIReference/API_AccessKey.html
const generateRandomKey = (length = 16, allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_') => Array.from(window.crypto.getRandomValues(new Uint32Array(length)))
  .map((x) => allowedChars[x % allowedChars.length])
  .join('')

class ObjectStore extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      selectedRows: [],
      createModalVisible: false,
      createModalKey: Math.random(),
      editModalVisible: false,
      editModalKey: Math.random(),
    }
  }

  showCreateModal = () => {
    this.setState({
      ...this.state,
      selected: {},
      createModalVisible: true,
      createModalKey: Math.random(),
    })
  }

  showEditModal = () => {
    this.setState({
      ...this.state,
      editModalVisible: true,
      editModalKey: Math.random(),
    })
  }

  render() {
    const me = this
    const { dispatch, loading, location } = this.props
    const { data } = this.props.objectstorage
    const { field, value } = queryString.parse(this.props.location.search)

    let objectStores = data.filter((item) => {
      if (field === 'name') {
        return item[field] && item[field].indexOf(value.trim()) > -1
      }
      return true
    })

    if (objectStores) {
      objectStores.sort((a, b) => a.name.localeCompare(b.name))
    }

    const createModalProps = {
      item: {
        accesskey: generateRandomKey(),
        secretkey: generateRandomKey(),
        numberOfReplicas: 3,
      },
      visible: this.state.createModalVisible,
      diskTags: [],
      nodeTags: [],
      tagsLoading: false,
      onCancel() {
        me.setState({
          ...me.state,
          createModalVisible: false,
        })
      },
      onOk(newObjectStore) {
        me.setState({
          ...me.state,
          createModalVisible: false,
        })
        dispatch({
          type: 'objectstorage/create',
          payload: newObjectStore,
        })
      },
    }

    const editModalProps = {
      selected: {},
      visible: this.state.editModalVisible,
      onCancel() {
        me.setState({
          ...me.state,
          editModalVisible: false,
        })
      },
      onOk(record) {
        me.setState({
          ...me.state,
          editModalVisible: false,
        })
        dispatch({
          type: 'objectstorage/update',
          payload: record,
        })
      },
    }

    const listProps = {
      dataSource: objectStores,
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
      editObjectStore: this.showEditModal,
      deleteObjectStore(record) {
        dispatch({
          type: 'objectstorage/delete',
          payload: record,
        })
      },
    }

    const filterProps = {
      location,
      defaultField: 'name',
      fieldOption: [
        { value: 'name', name: 'Name' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter
        filterField && filterValue ? dispatch(routerRedux.push({
          pathname: '/objectstores',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/objectstores',
          search: queryString.stringify({}),
        }))
      },
    }

    const bulkActionsProps = {
      selectedRows: this.state.selectedRows,
      deleteObjectStore(record) {
        dispatch({
          type: 'objectstorage/bulkDelete',
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
            <ObjectStoreBulkActions {...bulkActionsProps} />
          </Col>
          <Col lg={{ offset: 13, span: 7 }} md={{ offset: 8, span: 10 }} sm={24} xs={24}>
            <Filter {...filterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" onClick={this.showCreateModal}>Create Object Store</Button>
        {this.state.createModalVisible && <CreateObjectStore key={this.createModalKey} {...createModalProps} />}
        {this.state.editModalVisible && <EditObjectStore key={this.editModalKey} {...editModalProps} />}
        <ObjectStoreList {...listProps} />
      </div>
    )
  }
}

ObjectStore.propTypes = {
  objectstorage: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(
  ({ objectstorage, loading }) => ({ objectstorage, loading: loading.models.objectStore })
)(ObjectStore)

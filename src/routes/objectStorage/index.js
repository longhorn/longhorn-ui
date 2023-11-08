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
import { generateRandomKey } from './helper/index'
import C from '../../utils/constants'

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
      commandKeyDown: false,
    }
  }

  componentDidMount() {
    let height = document.getElementById('objectStoreTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
    window.onresize = () => {
      height = document.getElementById('objectStoreTable').offsetHeight - C.ContainerMarginHeight
      this.setState({
        height,
      })
      this.props.dispatch({ type: 'app/changeNavbar' })
    }
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount() {
    window.onresize = () => {
      this.props.dispatch({ type: 'app/changeNavbar' })
    }
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  onKeyUp = () => {
    this.setState({
      ...this.state,
      commandKeyDown: false,
    })
  }

  onKeyDown = (e) => {
    if ((e.keyCode === 91 || e.keyCode === 17) && !this.state.commandKeyDown) {
      this.setState({
        ...this.state,
        commandKeyDown: true,
      })
    }
  }

  showCreateModal = () => {
    this.setState({
      ...this.state,
      selectedRows: [],
      createModalVisible: true,
      createModalKey: Math.random(),
    })
  }

  render() {
    const me = this
    const { dispatch, loading, location } = this.props
    const { data, sorter } = this.props.objectstorage
    const { field, value } = queryString.parse(this.props.location.search)

    const settings = this.props.setting.data
    const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
    const defaultDataLocalitySetting = settings.find(s => s.id === 'default-data-locality')
    const defaultRevisionCounterSetting = settings.find(s => s.id === 'disable-revision-counter')
    const enableSPDKDataEngineSetting = settings.find(s => s.id === 'v2-data-engine')

    const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
    const defaultDataLocalityOption = defaultDataLocalitySetting?.definition?.options ? defaultDataLocalitySetting.definition.options : []
    const defaultDataLocalityValue = defaultDataLocalitySetting?.value ? defaultDataLocalitySetting.value : 'disabled'
    const defaultRevisionCounterValue = defaultRevisionCounterSetting?.value === 'true'
    const enableSPDKDataEngineValue = enableSPDKDataEngineSetting?.value === 'true'

    const secret = this.props.secret.data

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
        numberOfReplicas: defaultNumberOfReplicas,
        diskTags: [],
        nodeTags: [],
        defaultDataLocalityOption,
        defaultDataLocalityValue,
        defaultRevisionCounterValue,
        enableSPDKDataEngineValue,
        tlsSecrets: secret,
      },
      visible: this.state.createModalVisible,
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
      selected: this.state.selectedRows[0],
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
            selectedRows: [...records],
          })
        },
      },
      editObjectStore: (record) => {
        me.setState({
          ...me.state,
          selectedRows: [record],
          editModalVisible: true,
          editModalKey: Math.random(),
        })
      },
      administrateObjectStore: (record) => {
        if (record.name?.length) {
          window.open(`objectstore/${record.name}/`, '_blank', 'noreferrer')
        }
      },
      deleteObjectStore: (record) => {
        dispatch({
          type: 'objectstorage/delete',
          payload: record,
        })
      },
      onSorterChange: (s) => {
        dispatch({
          type: 'objectstorage/updateSorter',
          payload: { field: s.field, order: s.order, columnKey: s.columnKey },
        })
      },
      sorter,
      onRowClick: (record) => {
        let selecteRowByClick = [record]
        if (me.state.commandKeyDown) {
          me.state.selectedRows.forEach((item) => {
            if (selecteRowByClick.every((ele) => {
              return ele.id !== item.id
            })) {
              selecteRowByClick.push(item)
            } else {
              selecteRowByClick = selecteRowByClick.filter((ele) => {
                return ele.id !== item.id
              })
            }
          })
        }
        me.setState({
          ...me.state,
          selectedRows: [...selecteRowByClick],
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
          pathname: '/objectstorage',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/objectstorage',
          search: queryString.stringify({}),
        }))
      },
    }

    const bulkActionsProps = {
      selectedRows: this.state.selectedRows,
      deleteObjectStore: (record) => {
        dispatch({
          type: 'objectstorage/bulkDelete',
          payload: record,
          callback: () => {
            me.setState({
              ...me.state,
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
  secret: PropTypes.object,
  setting: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(
  ({ objectstorage, secret, setting, loading }) => ({ objectstorage, secret, setting, loading: loading.models.objectStore })
)(ObjectStore)

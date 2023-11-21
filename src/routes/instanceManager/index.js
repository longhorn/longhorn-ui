import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import { routerRedux } from 'dva/router'
import queryString from 'query-string'
import { Filter } from '../../components/index'
import InstanceManagerList from './InstanceManagerList'
import RefCountVolumeModal from './RefCountVolumeModal'
import C from '../../utils/constants'

class InstanceManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      refCountVolumeModalVisible: false,
      refCountVolumeModalKey: Math.random(),
      refCountVolumeModalDatasource: [],
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
    const height = document.getElementById('instanceManagerTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
  }

  render() {
    const { loading, location, dispatch, instanceManager, volume } = this.props
    const instanceManagerData = instanceManager.data
    const volumeData = volume.data
    const me = this

    let data = instanceManagerData.map((item) => {
      item.volume = []
      volumeData.forEach(ele => {
        let engineForVolume = ele?.controllers && ele?.controllers[0] && item.name === ele.controllers[0].instanceManagerName
        let replicasForVolume = ele?.replicas?.length > 0 && ele.replicas.some((replica) => replica.instanceManagerName === item.name)
        if (engineForVolume && item.managerType === 'engine') {
          item.volume.push(ele)
        }
        if (replicasForVolume && item.managerType === 'replica') {
          item.volume.push(ele)
        }
        if ((replicasForVolume || engineForVolume) && item.managerType === 'aio') {
          item.volume.push(ele)
        }
      })
      return item
    })

    const instanceManagerFilterProps = {
      location,
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'nodeID', name: 'Node' },
        { value: 'managerType', name: 'Type' },
        { value: 'currentState', name: 'State' },
        { value: 'image', name: 'Instance Manager Image' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue } = filter

        filterField && (filterValue) ? dispatch(routerRedux.push({
          pathname: '/instanceManager',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/instanceManager',
          search: queryString.stringify({}),
        }))
      },
    }

    const InstanceManagerListProps = {
      dataSource: data,
      height: this.state.height,
      loading,
      showRefCountVolumeModal: (volumes) => {
        if (volumes) {
          me.setState({
            ...me.state,
            refCountVolumeModalDatasource: volumes,
            refCountVolumeModalVisible: true,
          })
        }
      },
    }

    const RefCountVolumeModalProps = {
      dataSource: this.state.refCountVolumeModalDatasource,
      visible: this.state.refCountVolumeModalVisible,
      onOk: () => {
        me.setState({
          ...me.state,
          refCountVolumeModalDatasource: [],
          refCountVolumeModalVisible: false,
          refCountVolumeModalKey: Math.random(),
        })
      },
    }

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24}>
          <Col lg={{ offset: 18, span: 6 }} md={{ offset: 16, span: 8 }} sm={24} xs={24} className="filter-input">
            <Filter {...instanceManagerFilterProps} />
          </Col>
        </Row>
        <InstanceManagerList {...InstanceManagerListProps} />
        {this.state.refCountVolumeModalVisible && <RefCountVolumeModal key={this.state.refCountVolumeModalKey} {...RefCountVolumeModalProps} />}
      </div>
    )
  }
}

InstanceManager.propTypes = {
  instanceManager: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect(({ instanceManager, volume, loading }) => ({ instanceManager, volume, loading: loading.models.engineimage }))(InstanceManager)

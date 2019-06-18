import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Button } from 'antd'
import queryString from 'query-string'
import VolumeList from './VolumeList'
import CreateVolume from './CreateVolume'
import ChangeVolumeModal from './ChangeVolumeModal'
import CreatePVAndPVC from './CreatePVAndPVC'
import CreatePVAndPVCSingle from './CreatePVAndPVCSingle'
import WorkloadDetailModal from './WorkloadDetailModal'
import SnapshotDetailModal from './SnapshotDetailModal'
import AttachHost from './AttachHost'
import EngineUgrade from './EngineUpgrade'
import UpdateReplicaCount from './UpdateReplicaCount'
import Salvage from './Salvage'
import { Filter } from '../../components/index'
import VolumeBulkActions from './VolumeBulkActions'
import { genAttachHostModalProps, getEngineUpgradeModalProps, getUpdateReplicaCountModalProps } from './helper'
import { healthyVolume, inProgressVolume, degradedVolume, detachedVolume, faultedVolume, filterVolume, isVolumeImageUpgradable } from '../../utils/filter'
import { addPrefix } from '../../utils/pathnamePrefix'

class Volume extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
    }
  }

  componentDidMount() {
    let height = document.getElementById('volumeTable').offsetHeight - 76
    this.setState({
      height,
    })
    window.onresize = () => {
      height = document.getElementById('volumeTable').offsetHeight - 76
      this.setState({
        height,
      })
    }
  }

  render() {
    const { dispatch, loading, location } = this.props
    const { selected, selectedRows, selectPVCaction, data, createPVAndPVCVisible, createPVAndPVCSingleVisible, createVolumeModalVisible, WorkloadDetailModalVisible, SnapshotDetailModalVisible, WorkloadDetailModalItem, SnapshotDetailModalItem, createPVAndPVCModalKey, createPVAndPVCModalSingleKey, createVolumeModalKey, WorkloadDetailModalKey, SnapshotDetailModalKey, attachHostModalVisible, attachHostModalKey, bulkAttachHostModalVisible, bulkAttachHostModalKey, engineUpgradeModalVisible, engineUpgradeModaKey, bulkEngineUpgradeModalVisible, bulkEngineUpgradeModalKey, salvageModalVisible, updateReplicaCountModalVisible, updateReplicaCountModalKey, sorter, defaultPVName, defaultPVCName, pvNameDisabled, defaultNamespace, nameSpaceDisabled, changeVolumeModalKey, changeVolumeModalVisible, changeVolumeActivate } = this.props.volume
    const hosts = this.props.host.data
    const engineImages = this.props.engineimage.data
    const { field, value, stateValue, nodeRedundancyValue, engineImageUpgradableValue } = queryString.parse(this.props.location.search)
    const volumeFilterMap = {
      healthy: healthyVolume,
      inProgress: inProgressVolume,
      degraded: degradedVolume,
      detached: detachedVolume,
      faulted: faultedVolume,
    }
    data.forEach(vol => {
      const found = hosts.find(h => vol.controller && h.id === vol.controller.hostId)
      if (found) {
        vol.host = found.name
      }
    })
    let volumes = data
    if (field && field === 'status' && volumeFilterMap[stateValue]) {
      volumes = volumeFilterMap[stateValue](volumes)
    } else if (field && field === 'engineImageUpgradable') {
      const defaultImage = engineImages.find(image => image.default === true)
      if (engineImageUpgradableValue === 'yes') {
        volumes = volumes.filter(item => isVolumeImageUpgradable(item, defaultImage))
      } else if (engineImageUpgradableValue === 'no') {
        volumes = volumes.filter(item => !isVolumeImageUpgradable(item, defaultImage))
      }
    } else if (field && field === 'namespace' && value) {
      volumes = filterVolume(volumes, field, value)
    } else if (field && field === 'replicaNodeRedundancy' && nodeRedundancyValue) {
      volumes = filterVolume(volumes, field, nodeRedundancyValue)
    } else if (field && value && field !== 'status' && field !== 'engineImageUpgradable' && field !== 'replicaNodeRedundancy') {
      volumes = filterVolume(volumes, field, value)
    }
    const volumeListProps = {
      dataSource: volumes,
      loading,
      engineImages,
      height: this.state.height,
      onSorterChange(s) {
        dispatch({
          type: 'volume/updateSorter',
          payload: { field: s.field, order: s.order, columnKey: s.columnKey },
        })
      },
      sorter,
      takeSnapshot(record) {
        dispatch({
          type: 'volume/actions',
          payload: {
            url: record.actions.snapshotCreate,
            params: {
              name: '',
            },
          },
        })
      },
      showEngineUpgrade(record) {
        dispatch({
          type: 'volume/showEngineUpgradeModal',
          payload: {
            selected: record,
          },
        })
      },
      showAttachHost(record) {
        dispatch({
          type: 'volume/showAttachHostModal',
          payload: {
            selected: record,
          },
        })
      },
      showSnapshots: (record) => {
        dispatch(routerRedux.push({
          pathname: addPrefix(`/volume/${record.name}/snapshots`),
        }))
      },
      showRecurring(record) {
        dispatch({
          type: 'volume/showRecurringModal',
          payload: {
            selected: record,
          },
        })
      },
      deleteVolume(record) {
        dispatch({
          type: 'volume/delete',
          payload: record,
        })
      },
      detach(url) {
        dispatch({
          type: 'volume/detach',
          payload: {
            url,
          },
        })
      },
      showBackups(record) {
        dispatch(routerRedux.push({
          pathname: addPrefix(`/backup/${record.name}`),
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: 'volumeName',
            keyword: record.name,
          }),
        }))
      },
      showSalvage(record) {
        dispatch({
          type: 'volume/showSalvageModal',
          payload: {
            selected: record,
          },
        })
      },
      showUpdateReplicaCount(record) {
        dispatch({
          type: 'volume/showUpdateReplicaCountModal',
          payload: {
            selected: record,
          },
        })
      },
      rollback(record) {
        dispatch({
          type: 'volume/rollback',
          payload: {
            image: record.currentImage,
            url: record.actions.engineUpgrade,
          },
        })
      },
      createPVAndPVC(actions) {
        dispatch({
          type: 'volume/showCreatePVCAndPVSingleModal',
          payload: actions,
        })
      },
      showWorkloadsStatusDetail(record) {
        dispatch({
          type: 'volume/showWorkloadDetailModal',
          payload: record,
        })
      },
      showSnapshotDetail(record) {
        if (record && record.length) {
          dispatch({
            type: 'volume/showSnapshotDetailModal',
            payload: record,
          })
        }
      },
      changeVolume(record) {
        dispatch({
          type: 'volume/showChangeVolumeModal',
          payload: record.actions.activate,
        })
      },
      rowSelection: {
        selectedRowKeys: selectedRows.map(item => item.id),
        onChange(_, records) {
          dispatch({
            type: 'volume/changeSelection',
            payload: {
              selectedRows: records,
            },
          })
        },
      },
    }

    const volumeFilterProps = {
      location,
      stateOption: [
        { value: 'healthy', name: 'Healthy' },
        { value: 'inProgress', name: 'In Progress' },
        { value: 'degraded', name: 'Degraded' },
        { value: 'faulted', name: 'Fault' },
        { value: 'detached', name: 'Detached' },
      ],
      replicaNodeRedundancyOption: [
        { value: 'yes', name: 'Yes' },
        { value: 'limited', name: 'Limited' },
        { value: 'no', name: 'No' },
      ],
      engineImageUpgradableOption: [
        { value: 'yes', name: 'Yes' },
        { value: 'no', name: 'No' },
      ],
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'host', name: 'Node' },
        { value: 'status', name: 'Status' },
        { value: 'namespace', name: 'Namespace' },
        { value: 'replicaNodeRedundancy', name: 'Node redundancy' },
        { value: 'engineImageUpgradable', name: 'Engine image upgradable' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue, stateValue: filterStateValue, nodeRedundancyValue: redundancyValue, engineImageUpgradableValue: imageUpgradableValue } = filter
        filterField && (filterValue || filterStateValue || redundancyValue || imageUpgradableValue) ? dispatch(routerRedux.push({
          pathname: addPrefix('/volume'),
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
            stateValue: filterStateValue,
            nodeRedundancyValue: redundancyValue,
            engineImageUpgradableValue: imageUpgradableValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: addPrefix('/volume'),
          search: queryString.stringify({}),
        }))
      },
    }

    const attachHostModalProps = genAttachHostModalProps(selected ? [selected] : [], hosts, attachHostModalVisible, dispatch)

    const bulkAttachHostModalProps = {
      items: selectedRows,
      visible: bulkAttachHostModalVisible,
      hosts,
      onOk(selectedHost, urls) {
        dispatch({
          type: 'volume/bulkAttach',
          payload: {
            host: selectedHost,
            urls,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideBulkAttachHostModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const engineUpgradeModalProps = getEngineUpgradeModalProps(selected ? [selected] : [], engineImages, engineUpgradeModalVisible, dispatch)

    const bulkEngineUpgradeModalProps = {
      items: selectedRows,
      visible: bulkEngineUpgradeModalVisible,
      engineImages,
      onOk(image, urls) {
        dispatch({
          type: 'volume/bulkEngineUpgrade',
          payload: {
            image,
            urls,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideBulkEngineUpgradeModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }
    const salvageModalProps = {
      item: selected,
      visible: salvageModalVisible,
      hosts,
      onOk(replicaNames, url) {
        dispatch({
          type: 'volume/salvage',
          payload: {
            replicaNames,
            url,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideSalvageModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const WorkloadDetailModalProps = {
      visible: WorkloadDetailModalVisible,
      item: WorkloadDetailModalItem,
      onOk() {
        dispatch({ type: 'volume/hideWorkloadDetailModal' })
      },
      onCancel() {
        dispatch({ type: 'volume/hideWorkloadDetailModal' })
      },
    }

    const SnapshotDetailModalProps = {
      visible: SnapshotDetailModalVisible,
      item: SnapshotDetailModalItem,
      onOk() {
        dispatch({ type: 'volume/hideSnapshotDetailModal' })
      },
      onCancel() {
        dispatch({ type: 'volume/hideSnapshotDetailModal' })
      },
    }

    const settings = this.props.setting.data
    const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
    const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
    const createVolumeModalProps = {
      item: {
        numberOfReplicas: defaultNumberOfReplicas,
        size: 20,
        iops: 1000,
        frontend: 'iscsi',
      },
      hosts,
      visible: createVolumeModalVisible,
      onOk(newVolume) {
        dispatch({
          type: 'volume/create',
          payload: newVolume,
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCreateVolumeModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const changeVolumeModalProps = {
      item: {
        frontend: 'iscsi',
      },
      hosts,
      visible: changeVolumeModalVisible,
      onOk(newVolume) {
        let data = Object.assign(newVolume, {url: changeVolumeActivate})
        dispatch({
          type: 'volume/volumeActivate',
          payload: data,
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideChangeVolumeModal',
        })
      },
    }

    const createPVAndPVCProps = {
      item: defaultNamespace,
      visible: createPVAndPVCVisible,
      nameSpaceDisabled,
      onOk(params) {
        dispatch({
          type: 'volume/createPVAndPVC',
          payload: {
            action: selectPVCaction,
            params,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCreatePVAndPVCModal',
        })
      },
      onChange() {
        dispatch({
          type: 'volume/changeCheckbox',
        })
      },
    }

    const createPVAndPVCSingleProps = {
      item: {
        defaultPVName,
        defaultPVCName,
        pvNameDisabled,
      },
      visible: createPVAndPVCSingleVisible,
      nameSpaceDisabled,
      onOk(params) {
        dispatch({
          type: 'volume/createPVAndPVCSingle',
          payload: {
            action: selectPVCaction,
            params,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCreatePVCAndPVSingleModal',
        })
      },
      onChange() {
        dispatch({
          type: 'volume/changeCheckbox',
        })
      },
    }

    const volumeBulkActionsProps = {
      selectedRows,
      engineImages,
      bulkDeleteVolume() {
        dispatch({
          type: 'volume/bulkDelete',
          payload: selectedRows,
        })
      },
      showBulkEngineUpgrade() {
        dispatch({
          type: 'volume/showBulkEngineUpgradeModal',
        })
      },
      showBulkAttachHost() {
        dispatch({
          type: 'volume/showBulkAttachHostModal',
        })
      },
      bulkDetach(urls) {
        dispatch({
          type: 'volume/bulkDetach',
          payload: urls,
        })
      },
      bulkBackup(actions) {
        dispatch({
          type: 'volume/bulkBackup',
          payload: actions,
        })
      },
      createPVAndPVC(actions) {
        dispatch({
          type: 'volume/showCreatePVAndPVCModal',
          payload: actions,
        })
      },
    }

    const addVolume = () => {
      dispatch({
        type: 'volume/showCreateVolumeModal',
      })
      this.setState({
        CreateVolumeGen() {
          return <CreateVolume {...createVolumeModalProps} />
        },
      })
    }

    const updateReplicaCountModalProps = getUpdateReplicaCountModalProps(selected, updateReplicaCountModalVisible, dispatch)

    return (
      <div className="content-inner" style={{display: 'flex', flexDirection: 'column', overflow: 'visible !important'}}>
        <Row gutter={24}>
          <Col lg={17} md={15} sm={24} xs={24}>
            <VolumeBulkActions {...volumeBulkActionsProps} />
          </Col>
          <Col lg={7} md={9} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Filter {...volumeFilterProps} />
          </Col>
        </Row>
        <Button style={{ position: 'absolute', top: '-50px', right: '0px' }} size="large" type="primary" onClick={addVolume}>Create Volume</Button>
        <VolumeList {...volumeListProps} />
        <WorkloadDetailModal key={WorkloadDetailModalKey} {...WorkloadDetailModalProps} />
        <SnapshotDetailModal key={SnapshotDetailModalKey} {...SnapshotDetailModalProps} />
        <ChangeVolumeModal key={changeVolumeModalKey} {...changeVolumeModalProps}/>
        <CreateVolume key={createVolumeModalKey} {...createVolumeModalProps} />
        <CreatePVAndPVC key={createPVAndPVCModalKey} {...createPVAndPVCProps} />
        <CreatePVAndPVCSingle key={createPVAndPVCModalSingleKey} {...createPVAndPVCSingleProps} />
        <AttachHost key={attachHostModalKey} {...attachHostModalProps} />
        <AttachHost key={bulkAttachHostModalKey} {...bulkAttachHostModalProps} />
        <EngineUgrade key={engineUpgradeModaKey} {...engineUpgradeModalProps} />
        <EngineUgrade key={bulkEngineUpgradeModalKey} {...bulkEngineUpgradeModalProps} />
        <Salvage {...salvageModalProps} />
        <UpdateReplicaCount key={updateReplicaCountModalKey} {...updateReplicaCountModalProps} />
      </div>
    )
  }
}

Volume.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
  engineimage: PropTypes.object,
  setting: PropTypes.object,
}

export default connect(({ engineimage, host, volume, setting, loading }) => ({ engineimage, host, volume, setting, loading: loading.models.volume }))(Volume)

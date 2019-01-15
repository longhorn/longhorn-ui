import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Button } from 'antd'
import VolumeList from './VolumeList'
import CreateVolume from './CreateVolume'
import AttachHost from './AttachHost'
import EngineUgrade from './EngineUpgrade'
import UpdateReplicaCount from './UpdateReplicaCount'
import Salvage from './Salvage'
import { Filter } from '../../components/index'
import VolumeBulkActions from './VolumeBulkActions'
import { genAttachHostModalProps, getEngineUpgradeModalProps, getUpdateReplicaCountModalProps } from './helper'
import { healthyVolume, inProgressVolume, degradedVolume, detachedVolume, faultedVolume, filterVolume } from '../../utils/filter'

class Volume extends React.Component {
  render() {
    const { dispatch, loading, location } = this.props
    const { selected, selectedRows, data, createVolumeModalVisible, createVolumeModalKey, attachHostModalVisible, attachHostModalKey, bulkAttachHostModalVisible, bulkAttachHostModalKey, engineUpgradeModalVisible, engineUpgradeModaKey, bulkEngineUpgradeModalVisible, bulkEngineUpgradeModalKey, salvageModalVisible, updateReplicaCountModalVisible, updateReplicaCountModalKey, sorter } = this.props.volume
    const hosts = this.props.host.data
    const engineImages = this.props.engineimage.data
    const { field, value, stateValue } = this.props.location.query
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
      volumes = volumeFilterMap[stateValue](data)
    } else if (field && value && field !== 'status') {
      volumes = filterVolume(data, field, value)
    }
    const volumeListProps = {
      dataSource: volumes,
      loading,
      engineImages,
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
          pathname: `/volume/${record.name}/snapshots`,
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
          pathname: '/backup',
          query: {
            field: 'volumeName',
            keyword: record.name,
          },
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
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'host', name: 'Node' },
        { value: 'status', name: 'Status' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue, stateValue: filterStateValue } = filter
        filterField && (filterValue || filterStateValue) ? dispatch(routerRedux.push({
          pathname: '/volume',
          query: {
            ...location.query,
            field: filterField,
            value: filterValue,
            stateValue: filterStateValue,
          },
        })) : dispatch(routerRedux.push({
          pathname: '/volume',
          query: {
          },
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
      <div className="content-inner" >
        <Row gutter={24}>
          <Col lg={18} md={16} sm={24} xs={24}>
            <VolumeBulkActions {...volumeBulkActionsProps} />
          </Col>
          <Col lg={6} md={8} sm={24} xs={24} style={{ marginBottom: 16 }}>
            <Filter {...volumeFilterProps} />
          </Col>
        </Row>
        <Button style={{ position: 'absolute', top: '-50px', right: '0px' }} size="large" type="primary" onClick={addVolume}>Create Volume</Button>
        <VolumeList {...volumeListProps} />
        <CreateVolume key={createVolumeModalKey} {...createVolumeModalProps} />
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

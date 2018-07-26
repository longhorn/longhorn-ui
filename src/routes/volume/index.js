import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import VolumeList from './VolumeList'
import VolumeFilter from './VolumeFilter'
import CreateVolume from './CreateVolume'
import AttachHost from './AttachHost'
import EngineUgrade from './EngineUpgrade'
import Salvage from './Salvage'
import VolumeBulkActions from './VolumeBulkActions'
import { genAttachHostModalProps, getEngineUpgradeModalProps } from './helper'

class Volume extends React.Component {
  render() {
    const { dispatch, loading, location } = this.props
    const { selected, selectedRows, data, createVolumeModalVisible, createVolumeModalKey, attachHostModalVisible, attachHostModalKey, bulkAttachHostModalVisible, bulkAttachHostModalKey, engineUpgradeModalVisible, engineUpgradeModaKey, bulkEngineUpgradeModalVisible, bulkEngineUpgradeModalKey, salvageModalVisible } = this.props.volume
    const hosts = this.props.host.data
    const engineImages = this.props.engineimage.data
    const { field, keyword } = this.props.location.query
    data.forEach(vol => {
      const found = hosts.find(h => vol.controller && h.id === vol.controller.hostId)
      if (found) {
        vol.host = found.name
      }
    })
    const volumeListProps = {
      dataSource: data,
      loading,
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
      hosts,
      field,
      location,
      keyword,
      onSearch(fieldsValue) {
        fieldsValue.keyword.length ? dispatch(routerRedux.push({
          pathname: '/volume',
          query: {
            ...location.query,
            field: fieldsValue.field,
            keyword: fieldsValue.keyword,
          },
        })) : dispatch(routerRedux.push({
          pathname: '/volume',
          query: {
          },
        }))
      },
      onSelect(selectedHost) {
        selectedHost ? dispatch(routerRedux.push({
          pathname: '/volume',
          query: {
            ...location.query,
            host: selectedHost,
          },
        })) : dispatch(routerRedux.push({
          pathname: '/volume',
          query: {
            field: location.query.field,
            keyword: location.query.keyword,
          },
        }))
      },
      onAdd: () => {
        dispatch({
          type: 'volume/showCreateVolumeModal',
        })
        this.setState({
          CreateVolumeGen(createVolumeModalProps) {
            return <CreateVolume {...createVolumeModalProps} />
          },
        })
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
      },
    }

    const createVolumeModalProps = {
      item: {
        numberOfReplicas: 3,
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
      },
    }

    const volumeBulkActionsProps = {
      selectedRows,
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

    return (
      <div className="content-inner" >
        <VolumeFilter {...volumeFilterProps} />
        <VolumeBulkActions {...volumeBulkActionsProps} />
        <VolumeList {...volumeListProps} />
        <CreateVolume key={createVolumeModalKey} {...createVolumeModalProps} />
        <AttachHost key={attachHostModalKey} {...attachHostModalProps} />
        <AttachHost key={bulkAttachHostModalKey} {...bulkAttachHostModalProps} />
        <EngineUgrade key={engineUpgradeModaKey} {...engineUpgradeModalProps} />
        <EngineUgrade key={bulkEngineUpgradeModalKey} {...bulkEngineUpgradeModalProps} />
        <Salvage {...salvageModalProps} />
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
}

export default connect(({ engineimage, host, volume, loading }) => ({ engineimage, host, volume, loading: loading.models.volume }))(Volume)

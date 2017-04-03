import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import VolumeList from './VolumeList'
import VolumeFilter from './VolumeFilter'
import CreateVolume from './CreateVolume'
import AttachHost from './AttachHost'
import Recurring from './Recurring'
import Snapshots from './Snapshots'

function Volume({ host, volume, location, loading, dispatch }) {
  const { data, snapshotsModalVisible, createVolumeModalVisible, attachHostModalVisible, recurringModalVisible } = volume
  const hosts = host.data
  const { field, keyword } = location.query

  const volumeListProps = {
    dataSource: data,
    loading,
    showAttachHost() {
      dispatch({
        type: 'volume/showAttachHostModal',
      })
    },
    showSnapshots() {
      dispatch({
        type: 'volume/showSnapshotsModal',
      })
    },
    showRecurring() {
      dispatch({
        type: 'volume/showRecurringModal',
      })
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
          host: location.query.host,
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
    onAdd() {
      dispatch({
        type: 'volume/showCreateVolumeModal',
      })
    },
  }

  const attachHostModalProps = {
    item: {
    },
    visible: attachHostModalVisible,
    hosts,
    onOk(newVolume) {
      dispatch({
        type: 'volume/attachHost',
        payload: newVolume,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideAttachHostModal',
      })
    },
  }

  const createVolumeModalProps = {
    item: {
      replicaNum: 2,
      size: 20,
      iops: 1000,
      frontend: 'iscsi',
    },
    hosts,
    visible: createVolumeModalVisible,
    onOk(newVolume) {
      dispatch({
        type: 'volume/createVolume',
        payload: newVolume,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideCreateVolumeModal',
      })
    },
  }

  const recurringModalProps = {
    item: {
    },
    visible: recurringModalVisible,
    onOk(recurring) {
      dispatch({
        type: 'volume/recurring',
        payload: recurring,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideRecurringModal',
      })
    },
  }

  const snapshotsModalProps = {
    item: {
    },
    visible: snapshotsModalVisible,
    onCancel() {
      dispatch({
        type: 'volume/hideSnapshotsModal',
      })
    },
  }

  const CreateVolumeGen = () =>
    <CreateVolume {...createVolumeModalProps} />

  const AttachHostGen = () =>
    <AttachHost {...attachHostModalProps} />

  const SnapshotsGen = () =>
    <Snapshots {...snapshotsModalProps} />

  const RecurringGen = () =>
    <Recurring {...recurringModalProps} />

  return (
    <div className="content-inner" >
      <VolumeFilter {...volumeFilterProps} />
      <VolumeList {...volumeListProps} />
      <CreateVolumeGen />
      <AttachHostGen />
      <RecurringGen />
      <SnapshotsGen />
    </div>
  )
}

Volume.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
}

export default connect(({ host, volume, loading }) => ({ host, volume, loading: loading.models.volume }))(Volume)

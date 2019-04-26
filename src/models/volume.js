import { create, deleteVolume, query, execAction, recurringUpdate, createVolumePV, createVolumePVC, createVolumeAllPVC } from '../services/volume'
import { wsChanges } from '../utils/websocket'
import { sortVolume } from '../utils/sort'
import { parse } from 'qs'
import { getSorter, saveSorter } from '../utils/store'
import queryString from 'query-string'

export default {
  namespace: 'volume',
  state: {
    data: [],
    selected: null,
    selectedRows: [],
    selectPVCaction: [],
    WorkloadDetailModalItem: {},
    SnapshotDetailModalItem: [],
    createVolumeModalVisible: false,
    createPVCModalVisible: false,
    createPVModalVisible: false,
    createPVCAllModalVisible: false,
    createPVAndPVCSingleVisible: false,
    createPVAndPVCVisible: false,
    WorkloadDetailModalVisible: false,
    SnapshotDetailModalVisible: false,
    attachHostModalVisible: false,
    bulkAttachHostModalVisible: false,
    engineUpgradeModalVisible: false,
    bulkEngineUpgradeModalVisible: false,
    updateReplicaCountModalVisible: false,
    recurringModalVisible: false,
    snapshotsModalVisible: false,
    salvageModalVisible: false,
    nameSpaceDisabled: false,
    pvNameDisabled: false,
    defaultPvOrPvcName: '',
    defaultNamespace: '',
    defaultPVName: '',
    defaultPVCName: '',
    createPVAndPVCModalSingleKey: Math.random(),
    WorkloadDetailModalKey: Math.random(),
    SnapshotDetailModalKey: Math.random(),
    createPVCAllModalKey: Math.random(),
    createVolumeModalKey: Math.random(),
    createPVAndPVCModalKey: Math.random(),
    createPVCModalKey: Math.random(),
    createPVModalKey: Math.random(),
    attachHostModalKey: Math.random(),
    bulkAttachHostModalKey: Math.random(),
    engineUpgradeModaKey: Math.random(),
    bulkEngineUpgradeModalKey: Math.random(),
    updateReplicaCountModalKey: Math.random(),
    socketStatus: 'closed',
    sorter: getSorter('volumeList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (!location.pathname.endsWith('/backup')) {
          dispatch({
            type: 'query',
            payload: queryString.parse(location.search),
          })
        }
      })
      wsChanges(dispatch, 'volumes', '1s')
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      if (payload && payload.field === 'id' && payload.keyword) {
        data.data = data.data.filter(item => item[payload.field].indexOf(payload.keyword) > -1)
      }
      if (payload && payload.field === 'host' && payload.keyword) {
        data.data = data.data.filter(item => item.controller && item.controller.hostId
          && payload.keyword.split(',').indexOf(item.controller.hostId) > -1)
      }
      sortVolume(data.data)
      yield put({ type: 'queryVolume', payload: { ...data } })
      yield put({ type: 'clearSelection' })
    },
    *engineUpgrade({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideEngineUpgradeModal' })
      yield call(execAction, payload.url, { image: payload.image })
      yield put({ type: 'query' })
    },
    *rollback({
      payload,
    }, { call, put }) {
      yield call(execAction, payload.url, { image: payload.image })
      yield put({ type: 'query' })
    },
    *detach({
      payload,
    }, { call, put }) {
      yield call(execAction, payload.url)
      yield put({ type: 'query' })
    },
    *attach({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideAttachHostModal' })
      yield call(execAction, payload.url, { hostId: payload.host })
      yield put({ type: 'query' })
    },
    *salvage({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideSalvageModal' })
      yield call(execAction, payload.url, { names: payload.replicaNames })
      yield put({ type: 'query' })
    },
    *create({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreateVolumeModal' })
      yield call(create, payload)
      yield put({ type: 'query' })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteVolume, payload)
      yield put({ type: 'query' })
    },
    *deleteReplicas({
      replicas,
    }, { call, put }) {
      yield replicas.map(replica => call(execAction, replica.removeUrl, { name: replica.name }))
      yield put({ type: 'query' })
    },
    *recurringUpdate({
      payload,
    }, { call, put }) {
      const data = {
        jobs: [],
      }
      payload.recurring.forEach(r => {
        data.jobs.push({ cron: r.cron, name: r.name, task: r.task, retain: r.retain })
      })
      yield call(recurringUpdate, data, payload.url)
      yield put({ type: 'query' })
    },
    *actions({
      payload,
    }, { call }) {
      yield call(execAction, payload.url, payload.params)
      if (payload.callBack) { yield call(payload.callBack, '') }
    },
    *replicaCountUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateReplicaCountModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *bulkDelete({
      payload,
    }, { call, put }) {
      yield payload.map(item => call(deleteVolume, item))
      yield put({ type: 'query' })
    },
    *bulkEngineUpgrade({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkEngineUpgradeModal' })
      yield payload.urls.map(url => call(execAction, url, { image: payload.image }))
      yield put({ type: 'query' })
    },
    *bulkDetach({
      payload,
    }, { call, put }) {
      yield payload.map(url => call(execAction, url))
      yield put({ type: 'query' })
    },
    *bulkAttach({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkAttachHostModal' })
      yield payload.urls.map(url => call(execAction, url, { hostId: payload.host }))
      yield put({ type: 'query' })
    },
    *bulkBackup({
      payload,
    }, { put }) {
      yield payload.map(item => put({ type: 'snapshotCreateThenBackup', payload: { snapshotCreateUrl: item.snapshotCreateUrl, snapshotBackupUrl: item.snapshotBackupUrl } }))
    },
    *createPV({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVModal' })
      yield payload.action.map(item => call(createVolumePV, payload.params, item))
      yield put({ type: 'query' })
    },
    *createAllPV({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVModal' })
      yield payload.map(item => call(createVolumePV, { pvName: item.name }, item.actions.pvCreate))
      yield put({ type: 'query' })
    },
    *createAllPVC({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVCAllModal' })
      yield payload.action.map(item => call(createVolumeAllPVC, payload.params.namespace, item.name, item.actions.pvcCreate))
      yield put({ type: 'query' })
    },
    *createPVAndPVC({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVAndPVCModal' })
      const pvAction = []
      payload.action.forEach((item) => {
        if (!item.kubernetesStatus.pvName) {
          pvAction.push(item)
        }
      })
      yield pvAction.map(item => call(createVolumePV, { pvName: item.name }, item.actions.pvCreate))
      if (payload.params.namespace) {
        yield payload.action.map(item => call(createVolumeAllPVC, payload.params.namespace, item.name, item.actions.pvcCreate))
      }
      yield put({ type: 'query' })
    },
    *createPVAndPVCSingle({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVCAndPVSingleModal' })
      if (!payload.action.kubernetesStatus.pvName) {
        yield call(createVolumePV, { pvName: payload.params.pvName }, payload.action.actions.pvCreate)
      }
      if (payload.params.namespace) {
        yield call(createVolumePVC, { pvcName: payload.params.pvcName, namespace: payload.params.namespace }, payload.action.actions.pvcCreate)
      }
      yield put({ type: 'query' })
    },
    *createPVC({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVCModal' })
      yield payload.action.map(item => call(createVolumePVC, payload.params, item))
      yield put({ type: 'query' })
    },
    *snapshotCreateThenBackup({
      payload,
    }, { call }) {
      const snapshot = yield call(execAction, payload.snapshotCreateUrl, {})
      yield call(execAction, payload.snapshotBackupUrl, { name: snapshot.name })
    },
  },
  reducers: {
    queryVolume(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateBackground(state, action) {
      const data = action.payload
      data.data = data.data || []
      if (data && data.field === 'id' && data.keyword) {
        data.data = data.data.filter(item => item[data.field].indexOf(data.keyword) > -1)
      }
      if (data && data.field === 'host' && data.keyword) {
        data.data = data.data.filter(item => item.controller && item.controller.hostId
          && data.keyword.split(',').indexOf(item.controller.hostId) > -1)
      }
      sortVolume(data.data)
      return {
        ...state,
        ...data,
      }
    },
    showCreateVolumeModal(state, action) {
      return { ...state, ...action.payload, createVolumeModalVisible: true, createVolumeModalKey: Math.random() }
    },
    showCreatePVCModal(state, action) {
      return { ...state, defaultPvOrPvcName: action.item.name, selectPVCaction: action.payload, createPVCModalVisible: true, createPVCModalKey: Math.random() }
    },
    showCreatePVModal(state, action) {
      return { ...state, defaultPvOrPvcName: action.item.name, selectPVCaction: action.payload, createPVModalVisible: true, createPVModalKey: Math.random() }
    },
    showCreatePVCAllModal(state, action) {
      return { ...state, createPVCAllModalVisible: true, selectPVCaction: action.payload, createPVCAllModalKey: Math.random() }
    },
    showCreatePVAndPVCModal(state, action) {
      return { ...state, createPVAndPVCVisible: true, selectPVCaction: action.payload, createPVAndPVCModalKey: Math.random() }
    },
    showCreatePVCAndPVSingleModal(state, action) {
      action.payload.kubernetesStatus.pvcName ? state.defaultPVCName = action.payload.kubernetesStatus.pvcName : state.defaultPVCName = action.payload.name
      action.payload.kubernetesStatus.pvName ? state.defaultPVName = action.payload.kubernetesStatus.pvName : state.defaultPVName = action.payload.name
      action.payload.kubernetesStatus.pvName ? state.pvNameDisabled = true : false
      return { ...state, nameSpaceDisabled: false, pvNameDisabled: state.pvNameDisabled, createPVAndPVCSingleVisible: true, defaultPVCName: state.defaultPVCName, defaultPVName: state.defaultPVName, selectPVCaction: action.payload, createPVAndPVCModalSingleKey: Math.random() }
    },
    changeCheckbox(state) {
      return { ...state, nameSpaceDisabled: !state.nameSpaceDisabled }
    },
    hideCreatePVCAndPVSingleModal(state) {
      return { ...state, createPVAndPVCSingleVisible: false, pvNameDisabled: false, createPVAndPVCModalSingleKey: Math.random() }
    },
    hideCreatePVAndPVCModal(state) {
      return { ...state, createPVAndPVCVisible: false, createPVAndPVCModalKey: Math.random() }
    },
    hideCreatePVCAllModal(state) {
      return { ...state, createPVCAllModalVisible: false, createPVCAllModalKey: Math.random() }
    },
    hideCreateVolumeModal(state) {
      return { ...state, createVolumeModalVisible: false }
    },
    hideCreatePVCModal(state) {
      return { ...state, createPVCModalVisible: false }
    },
    hideCreatePVModal(state) {
      return { ...state, createPVModalVisible: false }
    },
    showWorkloadDetailModal(state, action) {
      return { ...state, WorkloadDetailModalVisible: true, WorkloadDetailModalItem: action.payload, WorkloadDetailModalKey: Math.random() }
    },
    hideWorkloadDetailModal(state) {
      return { ...state, WorkloadDetailModalVisible: false, WorkloadDetailModalKey: Math.random() }
    },
    showSnapshotDetailModal(state, action) {
      return { ...state, SnapshotDetailModalVisible: true, SnapshotDetailModalItem: action.payload, SnapshotDetailModalKey: Math.random() }
    },
    hideSnapshotDetailModal(state) {
      return { ...state, SnapshotDetailModalVisible: false, SnapshotDetailModalKey: Math.random() }
    },
    showAttachHostModal(state, action) {
      return { ...state, ...action.payload, attachHostModalVisible: true, attachHostModalKey: Math.random() }
    },
    showBulkAttachHostModal(state, action) {
      return { ...state, ...action.payload, bulkAttachHostModalVisible: true, bulkAttachHostModalKey: Math.random() }
    },
    hideAttachHostModal(state) {
      return { ...state, attachHostModalVisible: false }
    },
    hideBulkAttachHostModal(state) {
      return { ...state, bulkAttachHostModalVisible: false }
    },
    showEngineUpgradeModal(state, action) {
      return { ...state, ...action.payload, engineUpgradeModalVisible: true, engineUpgradeModaKey: Math.random() }
    },
    showBulkEngineUpgradeModal(state, action) {
      return { ...state, ...action.payload, bulkEngineUpgradeModalVisible: true, bulkEngineUpgradeModalKey: Math.random() }
    },
    hideEngineUpgradeModal(state) {
      return { ...state, engineUpgradeModalVisible: false }
    },
    hideBulkEngineUpgradeModal(state) {
      return { ...state, bulkEngineUpgradeModalVisible: false }
    },
    showRecurringModal(state, action) {
      return { ...state, ...action.payload, recurringModalVisible: true }
    },
    hideRecurringModal(state) {
      return { ...state, recurringModalVisible: false }
    },
    showSnapshotsModal(state, action) {
      return { ...state, ...action.payload, snapshotsModalVisible: true }
    },
    hideSnapshotsModal(state) {
      return { ...state, snapshotsModalVisible: false }
    },
    showSalvageModal(state, action) {
      return { ...state, ...action.payload, salvageModalVisible: true }
    },
    hideSalvageModal(state) {
      return { ...state, salvageModalVisible: false }
    },
    showUpdateReplicaCountModal(state, action) {
      return { ...state, ...action.payload, updateReplicaCountModalVisible: true, updateReplicaCountModalKey: Math.random() }
    },
    hideUpdateReplicaCountModal(state) {
      return { ...state, updateReplicaCountModalVisible: false }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [] }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateSorter(state, action) {
      saveSorter('volumeList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
  },
}

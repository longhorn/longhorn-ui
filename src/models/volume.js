import { create, deleteVolume, query, execAction, recurringUpdate, createVolumePV, createVolumePVC, createVolumeAllPVC, volumeActivate, getNodeTags, getDiskTags, expandVolume, cancelExpansion } from '../services/volume'
import { wsChanges } from '../utils/websocket'
import { sortVolume } from '../utils/sort'
import { parse } from 'qs'
import { routerRedux } from 'dva/router'
import { getSorter, saveSorter } from '../utils/store'
import queryString from 'query-string'
import { addPrefix } from '../utils/pathnamePrefix'

export default {
  namespace: 'volume',
  state: {
    data: [],
    selected: null,
    selectedRows: [],
    selectPVCaction: [],
    WorkloadDetailModalItem: {},
    SnapshotDetailModalItem: [],
    nodeTags: [],
    diskTags: [],
    recurringList: [],
    tagsLoading: true,
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
    previousChecked: false,
    expansionVolumeSizeModalVisible: false,
    pvNameDisabled: false,
    changeVolumeModalVisible: false,
    bulkChangeVolumeModalVisible: false,
    SnapshotBulkModalVisible: false,
    bulkExpandVolumeModalVisible: false,
    changeVolumeActivate: '',
    defaultPvOrPvcName: '',
    defaultNamespace: '',
    defaultPVName: '',
    defaultPVCName: '',
    previousNamespace: '',
    changeVolumeModalKey: Math.random(),
    bulkChangeVolumeModalKey: Math.random(),
    bulkExpandVolumeModalKey: Math.random(),
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
    expansionVolumeSizeModalKey: Math.random(),
    updateReplicaCountModalKey: Math.random(),
    SnapshotBulkModalKey: Math.random(),
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
      yield call(execAction, payload.url, { hostId: payload.host, disableFrontend: payload.disableFrontend })
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
    *showCreateVolumeModalBefore({
      payload,
    }, { call, put }) {
      yield put({ type: 'showCreateVolumeModal' })
      const nodeTags = yield call(getNodeTags, payload)
      const diskTags = yield call(getDiskTags, payload)
      if (nodeTags.status === 200 && diskTags.status === 200) {
        yield put({ type: 'changeTagsLoading', payload: { nodeTags: nodeTags.data, diskTags: diskTags.data, tagsLoading: false } })
      } else {
        yield put({ type: 'changeTagsLoading', payload: { tagsLoading: false } })
      }
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteVolume, payload)
      yield put({ type: 'query' })
    },
    *deleteAndRedirect({
      payload,
    }, { call, put }) {
      yield call(deleteVolume, payload)
      yield put(routerRedux.push({
        pathname: addPrefix('/volume'),
      }))
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
        if (r.task === 'backup') {
          data.jobs.push({ cron: r.cron, name: r.name, task: r.task, retain: r.retain, labels: r.labels })
        } else {
          data.jobs.push({ cron: r.cron, name: r.name, task: r.task, retain: r.retain })
        }
      })
      yield call(recurringUpdate, data, payload.url)
      yield put({ type: 'hideSnapshotDetailModal' })
      yield put({ type: 'query' })
    },
    *bulkRecurringUpdate({
      payload,
    }, { call, put }) {
      if (payload.selectedRows && payload.recurringList) {
        const data = {
          jobs: [],
        }
        let selectedRows = payload.selectedRows.filter((row) => !row.standby)

        payload.recurringList.forEach(r => {
          if (r.task === 'backup') {
            data.jobs.push({ cron: r.cron, name: r.name, task: r.task, retain: r.retain, labels: r.labels })
          } else {
            data.jobs.push({ cron: r.cron, name: r.name, task: r.task, retain: r.retain })
          }
        })
        yield selectedRows.map(row => call(recurringUpdate, data, row.actions.recurringUpdate))
      }
      yield put({ type: 'hideSnapshotBulkModal' })
      yield put({ type: 'query' })
    },
    *volumeActivate({
      payload,
    }, { call, put }) {
      yield call(volumeActivate, { frontend: payload.frontend }, payload.url)
      yield put({ type: 'hideChangeVolumeModal' })
      yield put({ type: 'query' })
    },
    *bulkVolumeActivate({
      payload,
    }, { call, put }) {
      yield payload.map((item) => call(volumeActivate, { frontend: item.frontend }, item.url))
      yield put({ type: 'hideBulkChangeVolumeModal' })
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
      yield payload.urls.map(url => call(execAction, url, { hostId: payload.host, disableFrontend: payload.disableFrontend }))
      yield put({ type: 'query' })
    },
    *bulkBackup({
      payload,
    }, { put }) {
      yield payload.actions.map(item => put({ type: 'snapshotCreateThenBackup', payload: { snapshotCreateUrl: item.snapshotCreateUrl, snapshotBackupUrl: item.snapshotBackupUrl, labels: payload.labels } }))
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
      let fsType = payload.params && payload.params.fsType ? payload.params.fsType : 'ext4'
      payload.action.forEach((item) => {
        if (!item.kubernetesStatus.pvName) {
          pvAction.push(item)
        }
      })
      yield pvAction.map(item => call(createVolumePV, { pvName: item.name, fsType }, item.actions.pvCreate))
      if (payload.params.createPvcChecked) {
        if (payload.params.previousChecked) {
          yield payload.action.map(item => {
            let namespace = payload.params.namespace
            let pvcname = item.name
            if (item.kubernetesStatus && item.kubernetesStatus.namespace) {
              namespace = item.kubernetesStatus.namespace
            }
            if (item.kubernetesStatus && item.kubernetesStatus.pvcName) {
              pvcname = item.kubernetesStatus.pvcName
            }
            return call(createVolumeAllPVC, namespace, pvcname, item.actions.pvcCreate)
          })
        } else {
          yield payload.action.map(item => {
            return call(createVolumeAllPVC, payload.params.namespace, item.name, item.actions.pvcCreate)
          })
        }
      }
      yield put({ type: 'query' })
    },
    *createPVAndPVCSingle({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVCAndPVSingleModal' })
      if (!payload.action.kubernetesStatus.pvName && payload.params && payload.params.pvName && payload.params.fsType) {
        yield call(createVolumePV, { pvName: payload.params.pvName, fsType: payload.params.fsType }, payload.action.actions.pvCreate)
      }
      if (payload.params && payload.params.namespace && payload.params.pvcName) {
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
    *expandVolume({
      payload,
    }, { call, put }) {
      let params = {}
      yield put({ type: 'hideExpansionVolumeSizeModal' })
      if (payload && payload.selected && payload.selected.actions && payload.params) {
        params.url = payload.selected.actions.expand
        params.data = payload.params

        yield call(expandVolume, params)
      }
    },
    *cancelExpansion({
      payload,
    }, { call }) {
      if (payload && payload.actions && payload.actions.cancelExpansion && payload.name) {
        yield call(cancelExpansion, { url: payload.actions.cancelExpansion, name: payload.name })
      }
    },
    *bulkExpandVolume({
      payload,
    }, { call, put }) {
      let params = {}
      yield put({ type: 'hideBulkExpansionVolumeSizeModal' })
      if (payload && payload.selectedRows && payload.selectedRows.length > 0) {
        for (let i = 0; i < payload.selectedRows.length; i++) {
          if (payload.selectedRows[i] && payload.selectedRows[i].actions && payload.selectedRows[i].actions.expand && payload.params) {
            params.url = payload.selectedRows[i].actions.expand
            params.data = payload.params

            yield call(expandVolume, params)
          }
        }
      }
    },
    *snapshotCreateThenBackup({
      payload,
    }, { call }) {
      const snapshot = yield call(execAction, payload.snapshotCreateUrl, {})
      yield call(execAction, payload.snapshotBackupUrl, { name: snapshot.name, labels: payload.labels })
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
      state.data.forEach((item) => {
        let flag = false
        data.data.forEach((ele) => {
          if (ele.id === item.id) {
            flag = true
            if (new Date(item.timestamp).getTime() > new Date(ele.timestamp).getTime()) {
              Object.assign(ele, item)
            }
          }
        })
        if (!flag && item.state !== 'deleting') {
          data.data.push(item)
        }
      })

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
    showChangeVolumeModal(state, aciton) {
      return { ...state, changeVolumeActivate: aciton.payload, changeVolumeModalVisible: true, changeVolumeModalKey: Math.random() }
    },
    hideChangeVolumeModal(state) {
      return { ...state, changeVolumeActivate: '', changeVolumeModalVisible: false, changeVolumeModalKey: Math.random() }
    },
    showBulkChangeVolumeModal(state) {
      return { ...state, bulkChangeVolumeModalVisible: true, bulkChangeVolumeModalKey: Math.random() }
    },
    hideBulkChangeVolumeModal(state) {
      return { ...state, bulkChangeVolumeModalVisible: false, bulkChangeVolumeModalKey: Math.random() }
    },
    showCreateVolumeModal(state, action) {
      return { ...state, ...action.payload, createVolumeModalVisible: true, createVolumeModalKey: Math.random() }
    },
    changeTagsLoading(state, action) {
      return { ...state, ...action.payload }
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
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.pvcName ? state.defaultPVCName = action.payload.kubernetesStatus.pvcName : state.defaultPVCName = action.payload.name
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.pvName ? state.defaultPVName = action.payload.kubernetesStatus.pvName : state.defaultPVName = action.payload.name
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.pvName ? state.pvNameDisabled = true : state.pvNameDisabled = false
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.lastPVCRefAt ? state.previousNamespace = action.payload.kubernetesStatus.namespace : state.previousNamespace = ''
      return { ...state, nameSpaceDisabled: false, previousChecked: !!(action.payload.kubernetesStatus && action.payload.kubernetesStatus.lastPVCRefAt), pvNameDisabled: state.pvNameDisabled, previousNamespace: state.previousNamespace, createPVAndPVCSingleVisible: true, defaultPVCName: state.defaultPVCName, defaultPVName: state.defaultPVName, selectPVCaction: action.payload, createPVAndPVCModalSingleKey: Math.random() }
    },
    changeCheckbox(state) {
      return { ...state, nameSpaceDisabled: !state.nameSpaceDisabled, previousChecked: !state.nameSpaceDisabled ? false : state.previousChecked }
    },
    setPreviousChange(state, action) {
      return { ...state, previousChecked: action.payload }
    },
    hideCreatePVCAndPVSingleModal(state) {
      return { ...state, createPVAndPVCSingleVisible: false, pvNameDisabled: false, previousChecked: false, createPVAndPVCModalSingleKey: Math.random() }
    },
    hideCreatePVAndPVCModal(state) {
      return { ...state, createPVAndPVCVisible: false, nameSpaceDisabled: false, previousChecked: false, createPVAndPVCModalKey: Math.random() }
    },
    hideCreatePVCAllModal(state) {
      return { ...state, createPVCAllModalVisible: false, createPVCAllModalKey: Math.random() }
    },
    hideCreateVolumeModal(state) {
      return { ...state, createVolumeModalVisible: false, tagsLoading: true }
    },
    hideCreatePVCModal(state) {
      return { ...state, createPVCModalVisible: false }
    },
    hideCreatePVModal(state) {
      return { ...state, createPVModalVisible: false }
    },
    showExpansionVolumeSizeModal(state, action) {
      return { ...state, selected: action.payload, expansionVolumeSizeModalVisible: true, expansionVolumeSizeModalKey: Math.random() }
    },
    hideExpansionVolumeSizeModal(state) {
      return { ...state, expansionVolumeSizeModalVisible: false, expansionVolumeSizeModalKey: Math.random() }
    },
    hideBulkExpansionVolumeSizeModal(state) {
      return { ...state, bulkExpandVolumeModalVisible: false, bulkExpandVolumeModalKey: Math.random() }
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
    hideSnapshotBulkModal(state) {
      return { ...state, SnapshotBulkModalVisible: false }
    },
    showSnapshotBulkModal(state, action) {
      return { ...state, SnapshotBulkModalVisible: true, selectedRows: action.payload, SnapshotBulkModalKey: Math.random() }
    },
    showBulkExpandVolumeModal(state, action) {
      return { ...state, bulkExpandVolumeModalVisible: true, selectedRows: action.payload, bulkExpandVolumeModalKey: Math.random() }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [] }
    },
    recurringBulkUpdate(state, action) {
      return { ...state, recurringList: action.payload.recurring }
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

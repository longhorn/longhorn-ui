import { create, deleteVolume, query, execAction, recurringUpdate } from '../services/volume'
import { sortVolumeByName } from '../utils/sort'
import { parse } from 'qs'

export default {
  namespace: 'volume',
  state: {
    data: [],
    selected: null,
    selectedRows: [],
    createVolumeModalVisible: false,
    attachHostModalVisible: false,
    bulckAttachHostModalVisible: false,
    engineUpgradeModalVisible: false,
    bulkEngineUpgradeModalVisible: false,
    recurringModalVisible: false,
    snapshotsModalVisible: false,
    salvageModalVisible: false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname !== '/backup') {
          dispatch({
            type: 'query',
            payload: location.query,
          })
        }
      })
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
      sortVolumeByName(data.data)
      yield put({ type: 'queryVolume', payload: { ...data } })
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
    *deleteReplica({
      payload,
    }, { call, put }) {
      yield call(execAction, payload.url, { name: payload.name })
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
    *bulkDelete({
      payload,
    }, { call, put }) {
      yield payload.map(item => call(deleteVolume, item))
      yield put({ type: 'query' })
      yield put({ type: 'clearSelection' })
    },
    *bulkEngineUpgrade({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkEngineUpgradeModal' })
      yield payload.urls.map(url => call(execAction, url, { image: payload.image }))
      yield put({ type: 'query' })
      yield put({ type: 'clearSelection' })
    },
    *bulkDetach({
      payload,
    }, { call, put }) {
      yield payload.map(url => call(execAction, url))
      yield put({ type: 'query' })
      yield put({ type: 'clearSelection' })
    },
    *bulkAttach({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkAttachHostModal' })
      yield payload.urls.map(url => call(execAction, url, { hostId: payload.host }))
      yield put({ type: 'query' })
      yield put({ type: 'clearSelection' })
    },
  },
  reducers: {
    queryVolume(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    showCreateVolumeModal(state, action) {
      return { ...state, ...action.payload, createVolumeModalVisible: true }
    },
    hideCreateVolumeModal(state) {
      return { ...state, createVolumeModalVisible: false }
    },
    showAttachHostModal(state, action) {
      return { ...state, ...action.payload, attachHostModalVisible: true }
    },
    showBulkAttachHostModal(state, action) {
      return { ...state, ...action.payload, bulkAttachHostModalVisible: true }
    },
    hideAttachHostModal(state) {
      return { ...state, attachHostModalVisible: false }
    },
    hideBulkAttachHostModal(state) {
      return { ...state, bulkAttachHostModalVisible: false }
    },
    showEngineUpgradeModal(state, action) {
      return { ...state, ...action.payload, engineUpgradeModalVisible: true }
    },
    showBulkEngineUpgradeModal(state, action) {
      return { ...state, ...action.payload, bulkEngineUpgradeModalVisible: true }
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
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [] }
    },
  },
}

import { create, deleteVolume, query, execAction } from '../services/volume'
import { parse } from 'qs'

export default {
  namespace: 'volume',
  state: {
    data: [],
    selected: {},
    createVolumeModalVisible: false,
    attachHostModalVisible: false,
    recurringModalVisible: false,
    snapshotsModalVisible: false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.query,
        })
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      if (payload && payload.field && payload.keyword) {
        data.data = data.data.filter(item => item[payload.field].indexOf(payload.keyword) > -1)
      }
      if (payload && payload.host) {
        data.data = data.data.filter(item => item.controller && item.controller.hostId === payload.host)
      }
      yield put({ type: 'queryVolume', payload: { ...data } })
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
    *actions({
      payload,
    }, { call }) {
      yield call(execAction, payload.url, payload.params)
      yield call(payload.callBack, '')
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
    hideAttachHostModal(state) {
      return { ...state, attachHostModalVisible: false }
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
  },
}

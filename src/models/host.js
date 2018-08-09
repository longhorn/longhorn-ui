import { query, toggleScheduling, updateDisk } from '../services/host'
import { wsChanges } from '../utils/websocket'
import { parse } from 'qs'

export default {
  namespace: 'host',
  state: {
    data: [],
    selected: {},
    selectedDiskID: '',
    modalVisible: false,
    addDiskModalVisible: false,
    replicaModalVisible: false,
    editDisksModalVisible: false,
    diskReplicaModalVisible: false,
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.query,
        })
      })
      wsChanges(dispatch, 'nodes', '1s')
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      data.data.sort((a, b) => a.name.localeCompare(b.name))
      yield put({ type: 'queryHost', payload: { ...data } })
    },
    *toggleScheduling({
      payload,
    }, { call, put }) {
      const data = {
        ...payload,
        allowScheduling: !payload.allowScheduling,
      }
      yield call(toggleScheduling, data)
      yield put({ type: 'query' })
    },
    *updateDisk({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideEditDisksModal' })
      if (payload.disableSchedulingDisks) {
        yield call(updateDisk, { disks: payload.disableSchedulingDisks }, payload.url)
      }
      yield call(updateDisk, { disks: payload.disks }, payload.url)
      yield put({ type: 'query' })
    },
  },
  reducers: {
    queryHost(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateBackground(state, action) {
      const data = action.payload
      data.data = data.data || []
      return {
        ...state,
        ...data,
      }
    },
    showModal(state, action) {
      return { ...state, ...action.payload, modalVisible: true }
    },
    hideModal(state) {
      return { ...state, modalVisible: false }
    },
    showAddDiskModal(state, action) {
      return { ...state, ...action.payload, addDiskModalVisible: true }
    },
    hideAddDiskModal(state) {
      return { ...state, addDiskModalVisible: false }
    },
    showReplicaModal(state, action) {
      return { ...state, ...action.payload, replicaModalVisible: true }
    },
    hideReplicaModal(state) {
      return { ...state, replicaModalVisible: false }
    },
    showEditDisksModal(state, action) {
      return { ...state, ...action.payload, editDisksModalVisible: true }
    },
    hideEditDisksModal(state) {
      return { ...state, editDisksModalVisible: false }
    },
    showDiskReplicaModal(state, action) {
      return { ...state, ...action.payload, diskReplicaModalVisible: true }
    },
    hideDiskReplicaModal(state) {
      return { ...state, diskReplicaModalVisible: false }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
  },
}

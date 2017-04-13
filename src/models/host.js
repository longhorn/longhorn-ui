import { query } from '../services/host'
import { parse } from 'qs'

export default {
  namespace: 'host',
  state: {
    data: [],
    selected: {},
    modalVisible: false,
    addDiskModalVisible: false,
    replicaModalVisible: false,
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
      yield put({ type: 'queryHost', payload: { ...data } })
    },
  },
  reducers: {
    queryHost(state, action) {
      return {
        ...state,
        ...action.payload,
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
  },
}

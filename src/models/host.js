import { query } from '../services/host'
import { parse } from 'qs'

export default {
  namespace: 'host',
  state: {
    data: [],
    modalVisible: false,
    addDiskModalVisible: false,
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'query' })
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
  },
}

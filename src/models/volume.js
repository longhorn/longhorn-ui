import { query } from '../services/volume'
import { parse } from 'qs'

export default {
  namespace: 'volume',
  state: {
    data: [],
    createVolumeModalVisible: false,
    attachHostModalVisible: false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname.indexOf('/volume') === 0) {
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
      if (payload.field && payload.keyword) {
        data.data = data.data.filter(item => item[payload.field].indexOf(payload.keyword) > -1)
      }
      if (payload.host) {
        data.data = data.data.filter(item => item.hostId === payload.host)
      }
      yield put({ type: 'queryVolume', payload: { ...data } })
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
  },
}

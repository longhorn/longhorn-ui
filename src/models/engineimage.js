import { create, deleteEngineImage, query } from '../services/engineimage'
import { wsChanges } from '../utils/websocket'
import { parse } from 'qs'

export default {
  namespace: 'engineimage',
  state: {
    data: [],
    createEngineImageModalVisible: false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.query,
        })
      })
      wsChanges(dispatch, 'engineimages', '1s')
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      if (payload && payload.field && payload.keyword) {
        data.data = data.data.filter(item => item[payload.field].indexOf(payload.keyword.trim()) > -1)
      }
      data.data.sort((a, b) => a.image.localeCompare(b.image))
      yield put({ type: 'queryEngineimage', payload: { ...data } })
    },
    *updateBackground({
      payload,
    }, { put }) {
      const data = payload
      if (payload && payload.field && payload.keyword) {
        data.data = data.data.filter(item => item[payload.field].indexOf(payload.keyword.trim()) > -1)
      }
      data.data.sort((a, b) => a.image.localeCompare(b.image))
      yield put({ type: 'queryEngineimage', payload: { ...data } })
    },
    *create({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreateEngineImageModal' })
      yield call(create, payload)
      yield put({ type: 'query' })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteEngineImage, payload)
      yield put({ type: 'query' })
    },
  },
  reducers: {
    queryEngineimage(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    showCreateEngineImageModal(state, action) {
      return { ...state, ...action.payload, createEngineImageModalVisible: true }
    },
    hideCreateEngineImageModal(state) {
      return { ...state, createEngineImageModalVisible: false }
    },
  },
}

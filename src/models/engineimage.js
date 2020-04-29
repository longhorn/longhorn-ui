import { create, deleteEngineImage, query } from '../services/engineimage'
import { wsChanges } from '../utils/websocket'
import { parse } from 'qs'
import queryString from 'query-string'

export default {
  namespace: 'engineimage',
  state: {
    data: [],
    createEngineImageModalVisible: false,
    createEngineImageModalKey: Math.random(),
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: queryString.parse(location.search),
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
      if (payload && payload.field && payload.keyword && data.data) {
        data.data = data.data.filter(item => item[payload.field] && item[payload.field].indexOf(payload.keyword.trim()) > -1)
      }
      if (data.data) {
        data.data.sort((a, b) => a.image.localeCompare(b.image))
      }
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
    updateBackground(state, action) {
      const data = action.payload
      data.data = data.data || []
      if (data && data.field && data.keyword) {
        data.data = data.data.filter(item => item[data.field].indexOf(data.keyword.trim()) > -1)
      }
      data.data.sort((a, b) => a.image.localeCompare(b.image))
      return {
        ...state,
        ...data,
      }
    },
    showCreateEngineImageModal(state, action) {
      return { ...state, ...action.payload, createEngineImageModalVisible: true, createEngineImageModalKey: Math.random() }
    },
    hideCreateEngineImageModal(state) {
      return { ...state, createEngineImageModalVisible: false }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
  },
}

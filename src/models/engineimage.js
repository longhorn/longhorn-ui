import { create, deleteEngineImage, query } from '../services/engineimage'
import { wsChanges, updateState } from '../utils/websocket'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'engineimage',
  state: {
    data: [],
    resourceType: 'engineImage',
    createEngineImageModalVisible: false,
    createEngineImageModalKey: Math.random(),
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'engineimage')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/engineimage') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, payload)
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
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.engineimage.ws)
      if (ws) {
        ws.open()
      } else {
        wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
      }
    },
    *stopWS({
      // eslint-disable-next-line no-unused-vars
      payload,
    }, { select }) {
      let ws = yield select(state => state.engineimage.ws)
      if (ws) {
        ws.close(1000)
      }
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
      return updateState(state, action)
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
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

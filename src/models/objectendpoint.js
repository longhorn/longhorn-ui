import { listObjectEndpoints, getObjectEndpoint, createObjectEndpoint, deleteObjectEndpoint } from '../services/objectendpoint'
import { wsChanges, updateState } from '../utils/websocket'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  namespace: 'objectEndpoint',
  state: {
    ws: null,
    data: [],
    selected: {},
    resourceType: 'objectEndpoint',
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'objectEndpoint')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/objectEndpoint') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({ payload }, { call, put }) {
      const data = yield call(listObjectEndpoints, payload)
      yield put({ type: 'listObjectEndpoints', payload: { ...data } })
    },
    *get({ payload }, { call, get }) {
      const data = yield call(getObjectEndpoint, payload)
      yield get({ type: 'getObjectEndpoint', payload: { ...data } })
    },
    *create({ payload, callback }, { call, put }) {
      yield call(createObjectEndpoint, payload)
      if (callback) callback()
      yield put({ type: 'quey' })
    },
    *delete({ payload, callback }, { call, put }) {
      yield call(deleteObjectEndpoint, payload)
      if (callback) callback()
      yield put({ type: 'query' })
    },
    *bulkDelete({ payload, callback }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteObjectEndpoint, item))
      }
      if (callback) callback()
      yield put({ type: 'query' })
    },
    *startWS({ payload }, { select }) {
      let ws = yield select(state => state.objectEndpoint.ws)
      if (ws) {
        ws.open()
      } else {
        wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
      }
    },
    // eslint-disable-next-line no-unused-vars
    *stopWS({ payload }, { select }) {
      let ws = yield select(state => state.objectEndpoint.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    listObjectEndpoints(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateBackground(state, action) {
      return updateState(state, action)
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

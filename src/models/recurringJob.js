import { query, create, update, deleteRecurringJob } from '../services/recurringJob'
import { parse } from 'qs'
import { wsChanges, updateState } from '../utils/websocket'
import queryString from 'query-string'

export default {
  ws: null,
  namespace: 'recurringJob',
  state: {
    data: [],
    selected: {},
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.pathname === '/recurringJob' ? queryString.parse(location.search) : '',
        })
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      yield put({ type: 'queryRecurringJob', payload: { ...data } })
    },
    *create({
      payload,
      callback,
    }, { call, put }) {
      yield call(create, payload)
      if (callback) callback()
      yield put({ type: 'query' })
    },
    *edit({
      payload,
      callback,
    }, { call, put }) {
      yield call(update, payload)
      if (callback) callback()
      yield put({ type: 'query' })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteRecurringJob, payload)
      yield put({ type: 'query' })
    },
    *bulkDelete({
      payload,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteRecurringJob, item))
      }
      yield put({ type: 'query' })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.recurringJob.ws)
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
      let ws = yield select(state => state.recurringJob.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    queryRecurringJob(state, action) {
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

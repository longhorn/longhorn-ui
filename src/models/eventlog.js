import { query } from '../services/eventlog'
import { wsChanges, updateState } from '../utils/websocket'
import { parse } from 'qs'
import { getSorter, saveSorter } from '../utils/store'

export default {
  ws: null,
  namespace: 'eventlog',
  state: {
    data: [],
    socketStatus: 'closed',
    sorter: getSorter('eventlogList.sorter'),
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
      yield put({ type: 'queryEventlog', payload: { ...data } })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.eventlog.ws)
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
      let ws = yield select(state => state.eventlog.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    updateBackground(state, action) {
      return updateState(state, action)
    },
    queryEventlog(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateSorter(state, action) {
      saveSorter('eventlogList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

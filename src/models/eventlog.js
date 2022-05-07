import { query } from '../services/eventlog'
import { wsChanges, updateState } from '../utils/websocket'
import { getSorter, saveSorter } from '../utils/store'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'eventlog',
  state: {
    data: [],
    resourceType: 'event',
    socketStatus: 'closed',
    sorter: getSorter('eventlogList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'eventlog')) {
          dispatch({
            type: 'query',
            payload: {},
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

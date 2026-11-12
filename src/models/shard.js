import { query } from '../services/shard'
import { wsChanges, updateState } from '../utils/websocket'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'shard',
  state: {
    data: [],
    resourceType: 'shard',
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'shard')) {
          dispatch({ type: 'query' })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, payload)
      yield put({ type: 'queryShard', payload: { ...data } })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.shard.ws)
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
      let ws = yield select(state => state.shard.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    queryShard(state, action) {
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

import { query, update } from '../services/setting'
import { wsChanges, updateState } from '../utils/websocket'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'setting',
  state: {
    data: [],
    resourceType: 'setting',
    saving: false,
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'setting')) {
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
      yield put({ type: 'querySetting', payload: { ...data } })
    },
    *update({ payload }, { call, put, select }) {
      yield put({ type: 'showSaving' })
      for (const key of Object.keys(payload)) {
        const data = yield select(({ setting }) => setting.data)
        const found = data.find(setting => setting.name === key)
        if (found && found.value !== payload[key]) {
          yield call(update, { ...found, value: payload[key] })
        }
      }
      yield put({ type: 'query' })
      yield put({ type: 'hideSaving' })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.setting.ws)
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
      let ws = yield select(state => state.setting.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    updateBackground(state, action) {
      return updateState(state, action)
    },
    querySetting(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    showSaving(state) {
      return {
        ...state,
        saving: true,
      }
    },
    hideSaving(state) {
      return {
        ...state,
        saving: false,
      }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

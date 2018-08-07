import { query, update } from '../services/setting'
import { wsChanges } from '../utils/websocket'
import { parse } from 'qs'

export default {
  namespace: 'setting',
  state: {
    data: [],
    saving: false,
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.query,
        })
      })
      wsChanges(dispatch, 'settings', '1s')
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
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
    *updateBackground({ payload }, { put }) {
      const data = payload
      yield put({ type: 'querySetting', payload: { ...data } })
    },
  },
  reducers: {
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
  },
}

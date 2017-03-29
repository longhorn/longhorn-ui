import { query } from '../services/backup'
import { parse } from 'qs'

export default {
  namespace: 'backup',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'query' })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      yield put({ type: 'queryBackup', payload: { ...data } })
    },
  },
  reducers: {
    queryBackup(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}

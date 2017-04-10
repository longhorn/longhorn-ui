import { query } from '../services/dashboard'
import { parse } from 'qs'

export default {
  state: {
  },
  subscriptions: {
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      yield put({ type: 'queryDashboard', payload: { ...data } })
    },
  },
  reducers: {
  },
}

import { query } from '../services/dashboard'
import { parse } from 'qs'

export default {
  namespace: 'dashboard',
  state: {
    numbers: [],
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
      yield put({ type: 'queryDashboard', payload: { ...data } })
    },
  },
  reducers: {
    queryDashboard(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}

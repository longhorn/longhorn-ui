import { query } from '../services/dashboard'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  namespace: 'dashboard',
  state: {
    numbers: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'dashboard')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/dashboard') ? queryString.parse(location.search) : {},
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

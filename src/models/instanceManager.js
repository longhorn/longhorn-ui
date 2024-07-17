import { query } from '../services/instanceManager'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'instanceManager',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'instanceManager')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/instanceManager') ? queryString.parse(location.search) : {},
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
      // filter data based on payload.field and payload.value
      if (payload && payload.field && payload.value && data.data) {
        const searchValue = payload.value.trim().toLowerCase()
        data.data = data.data.filter(item => item[payload.field] && item[payload.field].toLowerCase().indexOf(searchValue) > -1)
      }
      if (data.data) {
        data.data.sort((a, b) => a.name.localeCompare(b.name))
      }
      yield put({ type: 'queryInstanceManager', payload: { ...data } })
    },
  },
  reducers: {
    queryInstanceManager(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}

import { query, deleteOrphaned } from '../services/orphanedData'
import { enableQueryData } from '../utils/dataDependency'
import queryString from 'query-string'

export default {
  ws: null,
  namespace: 'orphanedData',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'orphanedData')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/orphanedData') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      let { data } = yield call(query)
      // Front-end filtering
      if (payload?.field && payload?.value) {
        switch (payload.field) {
          case 'node':
            data = data.filter(item => item.nodeID.indexOf(payload.value) > -1)
            break
          case 'diskPath':
            data = data.filter(item => item.parameters?.DiskPath.indexOf(payload.value) > -1)
            break
          case 'diskName':
            data = data.filter(item => item.parameters?.DiskName.indexOf(payload.value) > -1)
            break
          case 'directoryName':
            data = data.filter(item => item.parameters?.DataName.indexOf(payload.value) > -1)
            break
          default:
        }
      }
      yield put({ type: 'setState', payload: { data } })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteOrphaned, payload)
      yield put({ type: 'query' })
    },
    *bulkDelete({
      payload,
      callback,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteOrphaned, item))
      }
      if (callback) callback()
      yield put({ type: 'query' })
    },
  },
  reducers: {
    setState(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}

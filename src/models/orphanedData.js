import { query, deleteOrphaned } from '../services/orphanedData'
import { enableQueryData } from '../utils/dataDependency'
import queryString from 'query-string'
import { ORPHAN_TYPES } from '../utils/orphanedData'

export default {
  ws: null,
  namespace: 'orphanedData',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname = '', search = '', hash = '' }) => {
        if (!enableQueryData(pathname, 'orphanedData') || !hash) return

        const payload = pathname.startsWith('/orphanedData')
          ? { ...queryString.parse(search), hash }
          : {}

        dispatch({ type: 'query', payload })
      })
    },
  },
  effects: {
    *query({
      payload = {},
    }, { call, put }) {
      let { data } = yield call(query)
      const currentOrphanType = payload.hash?.substring(1)

      // filter by orphan type
      data = data.filter(orphan => {
        if (currentOrphanType === ORPHAN_TYPES.REPLICA_DATA) return orphan.orphanType === ORPHAN_TYPES.REPLICA_DATA

        return (
          orphan.orphanType === ORPHAN_TYPES.ENGINE_INSTANCE || orphan.orphanType === ORPHAN_TYPES.REPLICA_INSTANCE
        )
      })

      // front-end filtering
      if (payload?.field && payload?.value) {
        const fieldMap = {
          node: item => item.nodeID?.includes(payload.value),
          diskPath: item => item.parameters?.DiskPath?.includes(payload.value),
          diskName: item => item.parameters?.DiskName?.includes(payload.value),
          directoryName: item => item.parameters?.DataName?.includes(payload.value),
          instanceName: item => item.parameters?.InstanceName?.includes(payload.value),
          instanceManager: item => item.parameters?.instanceManager?.includes(payload.value),
          orphanType: item => item.orphanType?.includes(payload.value),
          dataEngine: item => item.dataEngine?.includes(payload.value),
        }

        const filterFn = fieldMap[payload.field]
        if (filterFn) {
          data = data.filter(filterFn)
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

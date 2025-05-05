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
      const { records = [], hash, field, value } = payload

      const deletedOrphanNames = records.map(item => item.name)
      const orphanTypeFilter = hash?.substring(1)

      // filter by orphan type and deleted orphans
      data = data.filter(orphan => {
        const isMatchingType = orphanTypeFilter === ORPHAN_TYPES.REPLICA_DATA
          ? orphan.orphanType === ORPHAN_TYPES.REPLICA_DATA
          : (orphan.orphanType === ORPHAN_TYPES.ENGINE_INSTANCE || orphan.orphanType === ORPHAN_TYPES.REPLICA_INSTANCE)

        const isDeleted = deletedOrphanNames.includes(orphan.name)
        return isMatchingType && !isDeleted
      })

      // front-end filtering
      if (field && value) {
        const fieldMap = {
          node: item => item.nodeID?.includes(value),
          diskPath: item => item.parameters?.DiskPath?.includes(value),
          diskName: item => item.parameters?.DiskName?.includes(value),
          directoryName: item => item.parameters?.DataName?.includes(value),
          instanceName: item => item.parameters?.InstanceName?.includes(value),
          instanceManager: item => item.parameters?.instanceManager?.includes(value),
          orphanType: item => item.orphanType?.includes(value),
          dataEngine: item => item.dataEngine?.includes(value),
        }

        const filterFn = fieldMap[field]
        if (filterFn) {
          data = data.filter(filterFn)
        }
      }

      yield put({ type: 'setState', payload: { data } })
    },
    *delete({
      payload = {},
    }, { call, put }) {
      yield call(deleteOrphaned, payload.records[0])
      yield put({ type: 'query', payload })
    },
    *bulkDelete({
      payload = {},
      callback,
    }, { call, put }) {
      if (payload && payload.records.length > 0) {
        yield payload.records.map(item => call(deleteOrphaned, item))
      }
      if (callback) callback()
      yield put({ type: 'query', payload })
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

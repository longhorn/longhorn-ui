import { querySystembackups, querySystemrestores, createSystembackups, deleteSystembackups, createSystemRestore, deleteSystemRestores } from '../services/systemBackups'
import { enableQueryData } from '../utils/dataDependency'
import { wsChanges } from '../utils/websocket'
import { formatSystemBackupData } from '../utils/formatter'
import queryString from 'query-string'

export default {
  ws: null,
  namespace: 'systemBackups',
  state: {
    wsSystemBackups: null,
    wsSystemRestores: null,
    systemBackupsField: '',
    systemBackupsValue: '',
    systemRestoresField: '',
    systemRestoresValue: '',
    systemBackupsFullData: [],
    systemBackupsData: [],
    systemRestoresData: [],
    socketSystemBackupsStatus: 'closed',
    socketSystemRestoresStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'systemBackups')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/systemBackups') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      let { data: systemBackupsData } = yield call(querySystembackups, payload)
      let { data: systemRestoresData } = yield call(querySystemrestores, payload)
      if (systemBackupsData && systemRestoresData) {
        yield put({ type: 'queryData', payload: { systemBackupsData, systemRestoresData } })
      }
    },
    *createSystemBackup({
      payload,
      callback,
    }, { call, put }) {
      yield call(createSystembackups, payload)
      if (callback) callback()
      yield put({ type: 'query' })
    },
    *deleteSystemBackup({
      payload,
    }, { call, put }) {
      yield call(deleteSystembackups, payload)
      yield put({ type: 'query' })
    },
    *bulkDeleteSystemBackup({
      payload,
    }, { call, put }) {
      if (payload?.selectedRows?.length > 0) {
        for (let i = 0; i < payload.selectedRows.length; i++) {
          yield call(deleteSystembackups, { name: payload.selectedRows[i].id })
        }
      }
      yield put({ type: 'query' })
    },
    *createSystemRestore({
      payload,
      callback,
    }, { call, put }) {
      yield call(createSystemRestore, payload)
      if (callback) callback()
      yield put({ type: 'query' })
    },
    *bulkDeleteSystemRestore({
      payload,
    }, { call, put }) {
      if (payload?.selectedRows?.length > 0) {
        for (let i = 0; i < payload.selectedRows.length; i++) {
          yield call(deleteSystemRestores, { name: payload.selectedRows[i].id })
        }
      }
      yield put({ type: 'query' })
    },
    *deleteSystemRestore({
      payload,
    }, { call, put }) {
      yield call(deleteSystemRestores, { name: payload.id })
      yield put({ type: 'query' })
    },
    *systemBackupsfilter({
      payload,
    }, { put }) {
      yield put({ type: 'setSystemBackupsfilter', payload })
      yield put({ type: 'query' })
    },
    *systemRestoresfilter({
      payload,
    }, { put }) {
      yield put({ type: 'setSystemRestoresfilter', payload })
      yield put({ type: 'query' })
    },
    *startWS({
      payload,
    }, { select }) {
      let wsSystemBackups = yield select(state => state.systemBackups.wsSystemBackups)
      let wsSystemRestores = yield select(state => state.systemBackups.wsSystemRestores)
      if (wsSystemBackups && wsSystemRestores) {
        wsSystemBackups.open()
        wsSystemRestores.open()
      } else {
        wsChanges(payload.dispatch, 'systembackups', '1s', payload.ns)
        wsChanges(payload.dispatch, 'systemrestores', '1s', payload.ns)
      }
    },
    *stopWS({
      // eslint-disable-next-line no-unused-vars
      payload,
    }, { select }) {
      let wsSystemBackups = yield select(state => state.systemBackups.wsSystemBackups)
      let wsSystemRestores = yield select(state => state.systemBackups.wsSystemRestores)
      if (wsSystemBackups && wsSystemRestores) {
        wsSystemRestores.close(1000)
        wsSystemBackups.close(1000)
      }
    },
  },
  reducers: {
    queryData(state, action) {
      // Add version to Restores
      const data = formatSystemBackupData(state, action.payload.systemBackupsData, action.payload.systemRestoresData)
      return {
        ...state,
        ...data,
        systemBackupsFullData: action.payload.systemBackupsData,
      }
    },
    updateBackgroundSystemBackups(state, action) {
      if (action.payload && action.payload.data) {
        const data = formatSystemBackupData(state, action.payload.data, state.systemRestoresData)
        return {
          ...state,
          ...data,
          systemBackupsFullData: action.payload.data,
        }
      }
      return {
        ...state,
      }
    },
    updateBackgroundSystemrestores(state, action) {
      if (action.payload && action.payload.data) {
        const data = formatSystemBackupData(state, state.systemBackupsFullData, action.payload.data)
        return {
          ...state,
          ...data,
        }
      }
      return {
        ...state,
      }
    },
    setSystemBackupsfilter(state, action) {
      let field = action?.payload?.field
      let value = action?.payload?.value
      if (field && value) {
        return {
          ...state,
          systemBackupsField: field,
          systemBackupsValue: value,
        }
      }
      return {
        ...state,
        systemBackupsField: '',
        systemBackupsValue: '',
      }
    },
    setSystemRestoresfilter(state, action) {
      let field = action?.payload?.field
      let value = action?.payload?.value
      if (field && value) {
        return {
          ...state,
          systemRestoresField: field,
          systemRestoresValue: value,
        }
      }
      return {
        ...state,
        systemRestoresField: '',
        systemRestoresValue: '',
      }
    },
    updateSocketStatusSystemBackups(state, action) {
      return { ...state, socketSystemBackupsStatus: action.payload }
    },
    updateSocketStatusSystemRestores(state, action) {
      return { ...state, socketSystemRestoresStatus: action.payload }
    },
    updateWsSystemBackups(state, action) {
      return { ...state, wsSystemBackups: action.payload }
    },
    updateWsSystemRestores(state, action) {
      return { ...state, wsSystemRestores: action.payload }
    },
  },
}

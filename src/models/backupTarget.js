import { queryBackupTarget, createBackupTarget, deleteBackupTarget, updateBackupTarget } from '../services/backupTarget'
import { message } from 'antd'
import { wsChanges, updateState } from '../utils/websocket'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'
import { delay } from 'dva/saga'

export default {
  ws: null,
  namespace: 'backupTarget',
  state: {
    data: [],
    resourceType: 'backupTarget',
    selectedRows: [],
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'backupTarget')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/backupTarget') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(queryBackupTarget, payload)
      if (payload && payload.field && payload.keyword && data.data) {
        data.data = data.data.filter(item => item[payload.field] && item[payload.field].indexOf(payload.keyword.trim()) > -1)
      }
      if (data.data) {
        data.data.sort((a, b) => a.name.localeCompare(b.name))
      }
      yield put({ type: 'queryBackupTarget', payload: { ...data } })
      yield put({ type: 'clearSelection' })
    },
    *create({
      payload,
    }, { call, put }) {
      const resp = yield call(createBackupTarget, payload)
      if (resp && resp.status === 200) {
        message.success(`Successfully create backup target ${payload.name}.`)
      }
      yield put({ type: 'query' })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteBackupTarget, payload)
      yield put({ type: 'query' })
    },
    *edit({
      payload,
    }, { call, put }) {
      yield call(updateBackupTarget, payload)
      yield delay(1000)
      yield put({ type: 'query' })
    },
    *bulkDelete({
      payload,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteBackupTarget, item))
      }
      yield put({ type: 'query' })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.backupTarget.ws)
      if (ws) {
        ws.open()
      } else {
        wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
      }
    },
    *stopWS({
      // eslint-disable-next-line no-unused-vars
      payload,
    }, { select }) {
      let ws = yield select(state => state.backupTarget.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    queryBackupTarget(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [] }
    },
    updateBackground(state, action) {
      return updateState(state, action)
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

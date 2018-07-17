import { query, execAction, restore, deleteBackup } from '../services/backup'
import { parse } from 'qs'
import { sortVolumeBackups } from '../utils/sort'

export default {
  namespace: 'backup',
  state: {
    backupVolumes: [],
    backupStatus: {},
    currentItem: {},
    restoreBackupModalVisible: false,
    restoreBackupModalKey: Math.random(),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (location.pathname === '/backup') {
          dispatch({
            type: 'query',
            payload: location.query,
          })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      const filter = payload && payload.field && payload.keyword
      if (data && data.status === 200) {
        yield put({ type: 'queryBackup', payload: { backupVolumes: data.data } })
        if (filter) {
          const found = data.data.find(b => b.name === payload.keyword)
          if (found) {
            const list = yield call(execAction, found.actions.backupList)
            sortVolumeBackups(list.data)
            yield put({ type: 'queryBackup', payload: { data: list.data } })
          } else {
            yield put({ type: 'queryBackup', payload: { data: [] } })
          }
        } else {
          yield put({ type: 'queryBackup', payload: { data: null } })
        }
      }
    },
    *queryBackupStatus({
      payload,
    }, { call, put }) {
      const data = yield call(execAction, payload.url)
      yield put({ type: 'updateBackupStatus', payload: { backupStatus: { ...data } } })
    },
    *restore({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideRestoreBackupModal' })
      yield call(restore, payload)
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteBackup, payload)
      yield put({ type: 'query', payload })
    },
  },
  reducers: {
    queryBackup(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateBackupStatus(state, action) {
      return {
        ...state,
        backupStatus: action.payload.backupStatus,
      }
    },
    showRestoreBackupModal(state, action) {
      return { ...state, ...action.payload, restoreBackupModalVisible: true, restoreBackupModalKey: Math.random() }
    },
    hideRestoreBackupModal(state) {
      return { ...state, restoreBackupModalVisible: false }
    },
  },
}

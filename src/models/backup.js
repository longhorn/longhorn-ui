import { query, execAction, restore, deleteBackup } from '../services/backup'
import { parse } from 'qs'
import { sortVolumeBackups } from '../utils/sort'

export default {
  namespace: 'backup',
  state: {
    backupStatus: {},
    data: [],
    backups: {},
    currentItem: {},
    restoreBackupModalVisible: false,
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
      let backups = []
      const data = yield call(query, parse(payload))
      const filter = payload && payload.field && payload.keyword
      if (data && data.status === 200) {
        for (const backup of data.data) {
          if ((filter && backup.name.indexOf(payload.keyword) > -1) || !filter) {
            backups.push(backup)
          }
        }
      }
      sortVolumeBackups(backups)
      yield put({ type: 'queryBackup', payload: { data: backups } })
    },
    *queryBackupList({
      payload,
    }, { call, put }) {
      const url = payload.url
      const list = yield call(execAction, url)
      sortVolumeBackups(list.data)
      yield put({ type: 'queryBackups', payload: { name: payload.name, data: list.data } })
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
      yield put({ type: 'queryBackupList', payload: { name: payload.volumeName, url: payload.listUrl } })
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
    queryBackups(state, action) {
      if (state.backups[action.payload.name]) {
        const current = state.backups[action.payload.name].data
        state.backups[action.payload.name].data = current.slice(current.length).concat(action.payload.data || [])
      } else {
        state.backups[action.payload.name] = {
          data: action.payload.data,
        }
      }
      return {
        ...state,
      }
    },
    showRestoreBackupModal(state, action) {
      return { ...state, ...action.payload, restoreBackupModalVisible: true }
    },
    hideRestoreBackupModal(state) {
      return { ...state, restoreBackupModalVisible: false }
    },
  },
}

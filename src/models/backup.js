import { query, execAction, restore, deleteBackup } from '../services/backup'
import { parse } from 'qs'

export default {
  namespace: 'backup',
  state: {
    data: [],
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
            const url = backup.actions.backupList
            const list = yield call(execAction, url)
            if (list && list.status === 200) {
              backups = backups.concat(list.data)
            }
          }
        }
      }
      yield put({ type: 'queryBackup', payload: { data: backups } })
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
      yield put({ type: 'query' })
    },
  },
  reducers: {
    queryBackup(state, action) {
      return {
        ...state,
        ...action.payload,
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

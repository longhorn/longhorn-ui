import { query, execAction, restore, deleteBackup } from '../services/backup'
import { parse } from 'qs'
import { sortVolumeBackups, sortTable } from '../utils/sort'
import { getSorter, saveSorter } from '../utils/store'

export default {
  namespace: 'backup',
  state: {
    backupVolumes: [],
    backupVolumesForSelect: [],
    filterText: 'all',
    backupStatus: {},
    currentItem: {},
    restoreBackupModalVisible: false,
    restoreBackupFilterKey: Math.random(),
    restoreBackupModalKey: Math.random(),
    sorter: getSorter('backupList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.query,
        })
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
        data.data.sort((a, b) => sortTable(a, b, 'name'))
        yield put({ type: 'queryBackup', payload: { backupVolumes: data.data, backupVolumesForSelect: data.data } })
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
        restoreBackupFilterKey: Math.random(),
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
    updateSorter(state, action) {
      saveSorter('backupList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
    filterBackupVolumes(state, action) {
      if (action.payload) {
        let key = action.payload.field
        let value = action.payload.value
        state.backupVolumes = []
        state.backupVolumesForSelect.find((item) => {
          if (item[key].indexOf(value) !== -1) {
            state.backupVolumes.push(item)
          }
          return null
        })
      }
      return { ...state, filterText: action.payload }
    },
  },
}

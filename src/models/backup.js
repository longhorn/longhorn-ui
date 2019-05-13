import { query, execAction, restore, deleteBackup, createVolume } from '../services/backup'
import { parse } from 'qs'
import queryString from 'query-string'
import { sortVolumeBackups, sortTable } from '../utils/sort'
import { getSorter, saveSorter } from '../utils/store'
import { routerRedux } from 'dva/router'

export default {
  namespace: 'backup',
  state: {
    backupVolumes: [],
    backupVolumesForSelect: [],
    filterText: 'all',
    backupStatus: {},
    currentItem: {},
    lastBackupUrl: '',
    baseImage: '',
    size: '',
    restoreBackupModalVisible: false,
    createVolumeStandModalVisible: false,
    restoreBackupFilterKey: Math.random(),
    restoreBackupModalKey: Math.random(),
    createVolumeStandModalKey: Math.random(),
    sorter: getSorter('backupList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if(history.location.pathname.indexOf('backup')> -1){
          dispatch({
            type: 'query',
            payload: queryString.parse(location.search),
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
    *createVolume({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreateVolumeStandModalVisible' })
      yield call(createVolume, payload)
      yield put(routerRedux.push('/volume')) 
    },
    *CreateStandVolume({
      payload,
    }, {call, put}) {
      const data = yield call(execAction, payload.actions.backupList)
      const found = data.data.find(b => b.name === payload.lastBackupName)
      yield put({ type: 'initModalUrl', found, payload})
      yield put({ type: 'showCreateVolumeStandModalVisible' })
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
    /** createVolumeStandModalVisible */
    showCreateVolumeStandModalVisible(state) {
      return { ...state, createVolumeStandModalVisible: true, createVolumeStandModalKey: Math.random() }
    },
    hideCreateVolumeStandModalVisible(state) {
      return { ...state, createVolumeStandModalVisible: false, createVolumeStandModalKey: Math.random() }
    },
    initModalUrl(state, action) {
      return { ...state, lastBackupUrl: action.found.url, baseImage: action.payload.baseImage, size: action.found.volumeSize }
    },
    /** createVolumeStandModalVisible end*/
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

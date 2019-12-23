import { query, execAction, restore, deleteBackup, createVolume, deleteAllBackups } from '../services/backup'
import { parse } from 'qs'
import queryString from 'query-string'
import { sortVolumeBackups, sortTable } from '../utils/sort'
import { getSorter, saveSorter } from '../utils/store'
import { routerRedux } from 'dva/router'
import { addPrefix } from '../utils/pathnamePrefix'

export default {
  namespace: 'backup',
  state: {
    backupVolumes: [],
    selectedRows: [],
    backupVolumesForSelect: [],
    WorkloadDetailModalItem: {},
    filterText: 'all',
    backupStatus: {},
    currentItem: {},
    lastBackupUrl: '',
    baseImage: '',
    previousChecked: false,
    size: '',
    backupLabel: {},
    bulkRestoreData: [],
    isBulkRestore: false,
    restoreBackupModalVisible: false,
    WorkloadDetailModalVisible: false,
    createVolumeStandModalVisible: false,
    showBackuplabelsModalVisible: false,
    restoreBackupFilterKey: Math.random(),
    restoreBackupModalKey: Math.random(),
    createVolumeStandModalKey: Math.random(),
    showBackupLabelsModalKey: Math.random(),
    sorter: getSorter('backupList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(() => {
        let search = history.location.search ? queryString.parse(history.location.search) : {}

        if (history.location.state || search.state) {
          dispatch({
            type: 'query',
            payload: search,
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
    *queryBackupDetailData({
      payload,
    }, { call, put }) {
      const data = yield call(execAction, payload.url)
      let lastBackup = null
      let params = {}

      if (data.data && data.data.length > 0) {
        data.data.forEach((item) => {
          if (item.name === payload.lastBackupName) {
            lastBackup = item
          }
        })
      }
      if (lastBackup) {
        params.fromBackup = lastBackup.url
        params.backupName = lastBackup.name
        params.numberOfReplicas = payload.numberOfReplicas
        params.volumeName = lastBackup.volumeName

        yield put({ type: 'showRestoreBackupModal', payload: { currentItem: params } })
      }
    },
    *queryBackupDetailBulkData({
      payload,
    }, { call, put }) {
      // const data = yield call(execAction, payload.url)
      if (payload && payload.selectedRows && payload.selectedRows.length > 0) {
        let data = []

        for (let i = 0; i < payload.selectedRows.length; i++) {
          if (payload.selectedRows[i].actions && payload.selectedRows[i].actions.backupList) {
            let res = yield call(execAction, payload.selectedRows[i].actions.backupList)
            if (res.data) {
              let lastBackup = null
              res.data.forEach((item) => {
                if (item.name === payload.selectedRows[i].lastBackupName) {
                  lastBackup = item
                }
              })
              data.push(lastBackup)
            }
          }
        }

        if (data && data.length > 0) {
          yield put({ type: 'showRestoreBulkBackupModal',
            payload: {
              currentItem: {
                name: '<Volume Name>',
                numberOfReplicas: payload.numberOfReplicas,
              },
              bulkRestoreData: data,
            },
          })
        }
      }
    },
    *restore({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideRestoreBackupModal' })
      yield call(restore, payload)
    },
    *restoreBulkBackup({
      payload,
    }, { call, put }) {
      let restoreBulkBackup = []
      yield put({ type: 'hideRestoreBackupModal' })
      if (payload.bulkRestoreData && payload.selectedBackup) {
        payload.bulkRestoreData.forEach((item) => {
          let params = {}
          params.numberOfReplicas = payload.selectedBackup.numberOfReplicas
          params.name = item.volumeName
          params.fromBackup = item.url
          restoreBulkBackup.push(params)
        })
      }
      if (restoreBulkBackup.length > 0) {
        for (let i = 0; i < restoreBulkBackup.length; i++) {
          yield call(restore, restoreBulkBackup[i])
        }
      }
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
      yield put(routerRedux.push({
        pathname: addPrefix('/volume'),
      }))
    },
    *CreateStandVolume({
      payload,
    }, { call, put }) {
      const data = yield call(execAction, payload.actions.backupList)
      const found = data.data.find(b => b.name === payload.lastBackupName)
      yield put({ type: 'initModalUrl', found, payload })
      yield put({ type: 'showCreateVolumeStandModalVisible' })
    },
    *deleteAllBackups({
      payload,
    }, { call, put }) {
      yield call(deleteAllBackups, payload)
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
    /** createVolumeStandModalVisible */
    showCreateVolumeStandModalVisible(state) {
      return { ...state, createVolumeStandModalVisible: true, createVolumeStandModalKey: Math.random() }
    },
    hideCreateVolumeStandModalVisible(state) {
      return { ...state, createVolumeStandModalVisible: false, createVolumeStandModalKey: Math.random() }
    },
    showBackuplabelsModalVisible(state, action) {
      return { ...state, showBackuplabelsModalVisible: true, backupLabel: action.payload, createVolumeStandModalKey: Math.random() }
    },
    hideBackuplabelsModalVisible(state) {
      return { ...state, showBackuplabelsModalVisible: false, createVolumeStandModalKey: Math.random() }
    },
    initModalUrl(state, action) {
      return { ...state, lastBackupUrl: action.found.url, baseImage: action.payload.baseImage, size: action.found.volumeSize }
    },
    showRestoreBackupModal(state, action) {
      return { ...state, ...action.payload, restoreBackupModalVisible: true, restoreBackupModalKey: Math.random() }
    },
    showRestoreBulkBackupModal(state, action) {
      return { ...state, ...action.payload, isBulkRestore: true, restoreBackupModalVisible: true, restoreBackupModalKey: Math.random() }
    },
    hideRestoreBackupModal(state) {
      return { ...state, previousChecked: false, restoreBackupModalVisible: false, isBulkRestore: false }
    },
    updateSorter(state, action) {
      saveSorter('backupList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
    showWorkloadDetailModal(state, action) {
      return { ...state, WorkloadDetailModalVisible: true, WorkloadDetailModalItem: action.payload, WorkloadDetailModalKey: Math.random() }
    },
    hideWorkloadDetailModal(state) {
      return { ...state, WorkloadDetailModalVisible: false, WorkloadDetailModalKey: Math.random() }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    setPreviousChange(state, action) {
      return { ...state, previousChecked: action.payload }
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

import { query, queryBackupList, execAction, restore, deleteBackup, syncBackupVolume, syncAllBackupVolumes, createVolume, deleteAllBackups, getNodeTags, getDiskTags, queryTarget } from '../services/backup'
import { message } from 'antd'
import { wsChanges } from '../utils/websocket'
import queryString from 'query-string'
import { sortTable } from '../utils/sort'
import { getSorter, saveSorter, getBackupVolumeName } from '../utils/store'
import { enableQueryData } from '../utils/dataDependency'

export default {
  namespace: 'backup',
  state: {
    wsBackup: null,
    wsBackupVolume: null,
    backupVolumes: [],
    backupData: [],
    selectedRows: [],
    workloadDetailModalItem: {},
    backupStatus: {},
    currentItem: [],
    currentBackupVolume: {},
    lastBackupUrl: '',
    volumeName: '',
    backupTargetMessage: '',
    previousChecked: false,
    tagsLoading: true,
    size: '',
    backupLabel: {},
    nodeTags: [],
    diskTags: [],
    backupVolumesForBulkCreate: [],
    search: {},
    restoreBackupModalVisible: false,
    backupTargetAvailable: false,
    workloadDetailModalVisible: false,
    createVolumeStandModalVisible: false,
    bulkCreateVolumeStandModalVisible: false,
    showBackuplabelsModalVisible: false,
    socketStatusBackupVolumes: 'closed',
    socketStatusBackups: 'closed',
    backupFilterKey: Math.random(),
    restoreBackupModalKey: Math.random(),
    createVolumeStandModalKey: Math.random(),
    bulkCreateVolumeStandModalKey: Math.random(),
    showBackupLabelsModalKey: Math.random(),
    workloadDetailModalKey: Math.random(),
    sorter: getSorter('backupList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'backup')) {
          let search = history.location && history.location.search && location.pathname.startsWith('/backup') ? queryString.parse(history.location.search) : {}
          if (getBackupVolumeName(search)) {
            // In backup detail page
            dispatch({
              type: 'queryBackup',
              payload: search,
            })
          } else {
            dispatch({
              type: 'queryBackupVolume',
              payload: search,
            })
          }
          dispatch({ type: 'queryBackupTarget', payload: { history } })
          // Record search params for volume detail page
          dispatch({
            type: 'recordSearch',
            payload: { search },
          })
        }
      })
    },
  },
  effects: {
    *queryBackupVolume({
      payload,
    }, { call, put }) {
      const resp = yield call(query, payload)
      if (resp && resp.status === 200) {
        resp.data.sort((a, b) => sortTable(a, b, 'name'))
        if (payload && payload.field === 'name' && payload.value !== '') {
          resp.data = resp.data.filter((item) => {
            return item.id.includes(payload.value)
          })
        }
        yield put({ type: 'setBackupVolumes', payload: { backupVolumes: resp.data || [] } })
      }
      yield put({ type: 'clearSelection' })
    },
    *queryBackup({
      payload,
    }, { call, put }) {
      const resp = yield call(queryBackupList, payload.keyword)
      if (resp && resp.status === 200) {
        resp.data.sort((a, b) => sortTable(a, b, 'id'))
        yield put({ type: 'setBackups', payload: { backupData: resp.data || [] } })
      }
    },
    *queryBackupTarget({
      payload,
    }, { call, put }) {
      const resp = yield call(queryTarget)
      if (resp && resp.data && resp.data[0]) {
        const backupNeededPages = ['/backup', '/backingImage', '/systemBackups']
        const isBackupNeededPage = payload?.history?.location?.pathname && payload.history.location.pathname !== '/' && backupNeededPages.some(page => payload.history.location.pathname.startsWith(page))
        if (isBackupNeededPage) {
          !resp.data[0].available ? message.error(resp.data[0].message) : message.destroy()
        }
        yield put({ type: 'setBackupTargetAvailable', payload: { backupTargetAvailable: resp.data[0].available, backupTargetMessage: resp.data[0].message } })
      }
    },
    *queryBackupStatus({
      payload,
    }, { call, put }) {
      const data = yield call(execAction, payload.url)
      yield put({ type: 'updateBackupStatus', payload: { backupStatus: { ...data } } })
    },
    *restoreLatestBackup({
      payload,
    }, { call, put }) {
      const data = yield call(execAction, payload.url)
      let lastBackup = null
      let params = {}

      if (data.data && data.data.length > 0) {
        data.data.forEach((item) => {
          if (item.id === payload.lastBackupName) {
            lastBackup = item
          }
        })
      }
      if (lastBackup) {
        params.fromBackup = lastBackup.url
        params.backupName = lastBackup.id
        params.numberOfReplicas = payload.numberOfReplicas
        params.volumeName = lastBackup.volumeName
        params.backingImage = payload.backingImage || ''

        yield put({ type: 'showRestoreBackupModal', payload: { currentItem: [params] } })
        yield put({ type: 'queryDiskTagsAndGetNodeTags' })
      }
    },
    *beforeShowRestoreBackupModal({
      payload,
    }, { put }) {
      yield put({ type: 'showRestoreBackupModal', payload })
      yield put({ type: 'queryDiskTagsAndGetNodeTags' })
    },
    *queryBackupDetailBulkData({
      payload,
    }, { call, put }) {
      if (payload && payload.selectedRows && payload.selectedRows.length > 0) {
        let data = []

        for (let i = 0; i < payload.selectedRows.length; i++) {
          if (payload.selectedRows[i].actions && payload.selectedRows[i].actions.backupList) {
            let res = yield call(execAction, payload.selectedRows[i].actions.backupList)
            if (res.data) {
              let lastBackup = null
              res.data.forEach((item) => {
                if (item.id === payload.selectedRows[i].lastBackupName) {
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
              currentItem: data.map(d => ({
                backupName: d.name,
                backingImage: d.volumeBackingImageName,
                fromBackup: d.url,
                volumeName: d.volumeName,
                numberOfReplicas: payload.numberOfReplicas,
              })),
            },
          })
          yield put({ type: 'queryDiskTagsAndGetNodeTags' })
        }
      }
    },
    *restore({
      payload,
    }, { call, put, select }) {
      yield put({ type: 'hideRestoreBackupModal' })
      yield call(restore, payload)
      const search = yield select(store => { return store.backup.search })
      yield put({ type: 'query', payload: { ...search } })
    },
    *queryDiskTagsAndGetNodeTags({
      payload,
    }, { call, put }) {
      const nodeTags = yield call(getNodeTags, payload)
      const diskTags = yield call(getDiskTags, payload)

      if (nodeTags.status === 200 && diskTags.status === 200) {
        yield put({ type: 'changeTagsLoading', payload: { nodeTags: nodeTags.data, diskTags: diskTags.data, tagsLoading: false } })
      } else {
        yield put({ type: 'changeTagsLoading', payload: { tagsLoading: false } })
      }
    },
    *restoreBulkBackup({
      payload,
    }, { call, put, select }) {
      yield put({ type: 'hideRestoreBackupModal' })
      if (payload.length > 0) {
        for (let i = 0; i < payload.length; i++) {
          const resp = yield call(restore, payload[i])
          if (resp && resp.status === 200) {
            message.success(`Successfully restore backup volume ${payload[i].name}`, 3)
          }
        }
      }
      const search = yield select(store => { return store.backup.search })
      yield put({ type: 'query', payload: { ...search } })
    },
    *delete({
      payload,
    }, { call, put, select }) {
      yield call(deleteBackup, payload)
      const search = yield select(store => { return store.backup.search })
      yield put({ type: 'query', payload: { ...search } })
    },
    *createVolume({
      payload,
    }, { call, put, select }) {
      yield put({ type: 'hideCreateVolumeStandModalVisible' })
      yield call(createVolume, payload)
      const search = yield select(store => { return store.backup.search })
      yield put({ type: 'query', payload: { ...search } })
    },
    *syncBackupVolume({
      payload,
    }, { call }) {
      const backVolName = payload.name
      const resp = yield call(syncBackupVolume, backVolName)
      if (resp && resp.status === 200) {
        message.success(`Successfully trigger backup volume ${backVolName} synchronization`, 5)
      }
    },
    *syncAllBackupVolumes({
      // eslint-disable-next-line no-unused-vars
      _payload }, { call }) {
      const resp = yield call(syncAllBackupVolumes)
      if (resp && resp.status === 200) {
        message.success('Successfully trigger all backup volumes synchronization', 5)
      }
    },
    *bulkCreateVolume({
      payload,
    }, { call, put, select }) {
      yield put({ type: 'hideBulkCreateVolumeStandModalVisible' })
      if (payload.length > 0) {
        for (let i = 0; i < payload.length; i++) {
          const resp = yield call(createVolume, payload[i])
          if (resp && resp.status === 200) {
            message.success(`Successfully create DR volume ${payload[i].name}`, 3)
          }
        }
      }
      const search = yield select(store => { return store.backup.search })
      yield put({ type: 'query', payload: { ...search } })
    },
    *CreateStandVolume({
      payload,
    }, { call, put }) {
      const data = yield call(execAction, payload.actions.backupList)
      const found = data.data.find(backup => backup.id === payload.lastBackupName)
      yield put({ type: 'setCurrentBackupVolume', payload: { currentBackupVolume: payload } })
      // For DR Volume
      yield put({ type: 'initModalUrl', found, payload })
      yield put({ type: 'showCreateVolumeStandModalVisible' })
      yield put({ type: 'queryDiskTagsAndGetNodeTags' })
    },
    *BulkCreateStandVolume({
      payload,
    }, { call, put }) {
      const data = yield payload.backupVolume.map((item) => call(execAction, item.actions.backupList))
      const volumes = data.map((item, index) => {
        const volume = payload.backupVolume[index]
        const lastBackup = item.data.find((backup) => backup.id === volume.lastBackupName)
        return {
          volumeName: volume.id,
          lastBackupUrl: lastBackup.url,
          size: lastBackup.volumeSize,
          backingImage: lastBackup.volumeBackingImageName,
        }
      })
      // For DR Volume
      yield put({ type: 'initBulkCreateModalUrl', volumes })
      yield put({ type: 'showBulkCreateVolumeStandModalVisible' })
      yield put({ type: 'queryDiskTagsAndGetNodeTags' })
    },
    *deleteAllBackups({
      payload,
    }, { call, put, select }) {
      yield call(deleteAllBackups, payload)
      const search = yield select(store => { return store.backup.search })
      yield put({ type: 'clearSelection' })
      yield put({ type: 'query', payload: { ...search } })
    },
    *startWS({
      payload,
    }, { select }) {
      if (payload.type === 'backupvolumes') {
        let wsBackupVolume = yield select(state => state.backup.wsBackupVolume)
        if (wsBackupVolume) {
          wsBackupVolume.open()
        } else {
          wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
        }
      }

      if (payload.type === 'backups' && getBackupVolumeName(payload.search)) {
        let wsBackup = yield select(state => state.backup.wsBackup)
        if (wsBackup) {
          wsBackup.open()
        } else {
          wsChanges(payload.dispatch, payload.type, '1s', payload.ns, payload.search)
        }
      } else {
        // Clear the backup ws connection
        let wsBackup = yield select(state => state.backup.wsBackup)
        if (wsBackup) wsBackup.close(1000)
      }
    },
    *stopWS({
      // eslint-disable-next-line no-unused-vars
      payload,
    }, { select }) {
      let search = yield select(state => state.backup.search)
      let wsBackup = yield select(state => state.backup.wsBackup)
      let wsBackupVolume = yield select(state => state.backup.wsBackupVolume)
      if (wsBackup && !getBackupVolumeName(search)) wsBackup.close(1000)
      if (wsBackupVolume) wsBackupVolume.close(1000)
    },
  },
  reducers: {
    setBackupVolumes(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    setBackups(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateBackgroundBackups(state, action) {
      let volumeName = getBackupVolumeName(state.search)
      if (volumeName && action.payload && action.payload.data) {
        let backupData = action.payload.data.filter((item) => {
          return item.volumeName === volumeName
        })
        return {
          ...state,
          backupData: backupData || [],
        }
      }
      return {
        ...state,
      }
    },
    updateSocketStatusBackups(state, action) {
      return { ...state, socketStatusBackups: action.payload }
    },
    updateBackgroundBackupVolumes(state, action) {
      if (action.payload && action.payload.data) {
        return {
          ...state,
          backupVolumes: action.payload.data || [],
        }
      } else {
        return {
          ...state,
        }
      }
    },
    updateSocketStatusBackupVolumes(state, action) {
      return { ...state, socketStatusBackupVolumes: action.payload }
    },
    setBackupTargetAvailable(state, action) {
      return { ...state, backupTargetAvailable: action.payload.backupTargetAvailable, backupTargetMessage: action.payload.backupTargetMessage }
    },
    clearSelection(state) {
      return {
        ...state,
        selectedRows: [],
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
      return { ...state, createVolumeStandModalVisible: false, createVolumeStandModalKey: Math.random(), currentBackupVolume: {} }
    },
    showBulkCreateVolumeStandModalVisible(state) {
      return { ...state, bulkCreateVolumeStandModalVisible: true, bulkCreateVolumeStandModalKey: Math.random() }
    },
    hideBulkCreateVolumeStandModalVisible(state) {
      return { ...state, backupVolumesForBulkCreate: [], bulkCreateVolumeStandModalVisible: false, bulkCreateVolumeStandModalKey: Math.random() }
    },
    showBackuplabelsModalVisible(state, action) {
      return { ...state, showBackuplabelsModalVisible: true, backupLabel: action.payload, createVolumeStandModalKey: Math.random() }
    },
    hideBackuplabelsModalVisible(state) {
      return { ...state, showBackuplabelsModalVisible: false, createVolumeStandModalKey: Math.random() }
    },
    initModalUrl(state, action) {
      return { ...state, lastBackupUrl: action.found.url, volumeName: action.payload.name, size: action.found.volumeSize }
    },
    initBulkCreateModalUrl(state, action) {
      return { ...state, backupVolumesForBulkCreate: action.volumes }
    },
    showRestoreBackupModal(state, action) {
      return { ...state, ...action.payload, restoreBackupModalVisible: true, restoreBackupModalKey: Math.random() }
    },
    showRestoreBulkBackupModal(state, action) {
      return { ...state, ...action.payload, restoreBackupModalVisible: true, restoreBackupModalKey: Math.random() }
    },
    hideRestoreBackupModal(state) {
      return { ...state, previousChecked: false, tagsLoading: true, restoreBackupModalVisible: false }
    },
    updateSorter(state, action) {
      saveSorter('backupList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
    showWorkloadDetailModal(state, action) {
      return { ...state, workloadDetailModalVisible: true, workloadDetailModalItem: action.payload, workloadDetailModalKey: Math.random() }
    },
    hideWorkloadDetailModal(state) {
      return { ...state, workloadDetailModalVisible: false, workloadDetailModalKey: Math.random() }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    setPreviousChange(state, action) {
      return { ...state, previousChecked: action.payload }
    },
    changeTagsLoading(state, action) {
      return { ...state, ...action.payload }
    },
    recordSearch(state, action) {
      return { ...state, ...action.payload }
    },
    setCurrentBackupVolume(state, action) {
      return { ...state, ...action.payload }
    },
    updateWsBackups(state, action) {
      if (action.payload && action.payload.search) {
        return { ...state, wsBackup: action.payload.rws }
      }
      return { ...state }
    },
    updateWsBackupVolumes(state, action) {
      return { ...state, wsBackupVolume: action.payload }
    },
  },
}

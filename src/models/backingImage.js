import {
  create,
  deleteBackingImage,
  deleteBackupBackingImage,
  execAction,
  queryBackupBackingImageList,
  query,
  deleteDisksOnBackingImage,
  uploadChunk,
  download,
  bulkDownload,
} from '../services/backingImage'
import { getNodeTags, getDiskTags } from '../services/backup'
import { message, notification } from 'antd'
import { delay } from 'dva/saga'
import { wsChanges, updateState } from '../utils/websocket'
import { enableQueryData } from '../utils/dataDependency'
import { sortByCreatedTime } from '../utils/sort'

export default {
  ws: null,
  namespace: 'backingImage',
  state: {
    wsBi: null, // backingImage websocket
    wsBbi: null, // backupBackingImage websocket
    resourceType: 'backingImage',
    data: [],
    bbiData: [], // backupBackingImage data
    selected: {},
    bbiSelected: {},
    selectedRows: [],
    nodeTags: [],
    diskTags: [],
    tagsLoading: true,
    minCopiesCountModalVisible: false,
    bbiSelectedRows: [], // selected backupBackingImage rows
    createBackingImageModalVisible: false,
    createBackingImageModalKey: Math.random(),
    diskStateMapDetailModalVisible: false,
    diskStateMapDetailModalKey: Math.random(),
    restoreBackupBackingImageModalVisible: false,
    diskStateMapDeleteDisabled: true,
    diskStateMapDeleteLoading: false,
    selectedDiskStateMapRows: [],
    selectedDiskStateMapRowKeys: [],
    biSearchField: '',
    biSearchValue: '',
    bbiSearchField: '',
    bbiSearchValue: '',
    biSocketStatus: 'closed',
    bbiSocketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'backingImage')) {
          dispatch({ type: 'query' })
          dispatch({ type: 'queryBackupBackingImage' })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, payload)
      if (data.data) {
        data.data.sort((a, b) => a.name.localeCompare(b.name))
      }
      yield put({ type: 'queryBackingImage', payload: { ...data } })
      yield put({ type: 'clearSelection' })
    },
    *queryBackupBackingImage({
      // eslint-disable-next-line no-unused-vars
      _payload,
    }, { call, put }) {
      const resp = yield call(queryBackupBackingImageList)
      if (resp && resp.data) {
        const bbiData = resp.data
        sortByCreatedTime(bbiData)
        yield put({ type: 'setBackupBackingImage', payload: { bbiData } })
      }
      yield put({ type: 'clearSelection' })
    },
    *createBackupBackingImage({
      payload,
    }, { call, put }) {
      const url = payload.actions.backupBackingImageCreate
      if (url) {
        const resp = yield call(execAction, url)
        if (resp && resp.status === 200) {
          message.success(`Successfully backed up ${payload.name} backing image`)
        }
        yield delay(1000)
        yield put({ type: 'queryBackupBackingImage' })
      } else {
        message.error('Failed to create backup, missing create backup backing image URL')
      }
    },
    *create({
      payload,
      callback,
    }, { call, put, select }) {
      yield put({ type: 'hideCreateBackingImageModal' })
      let resp = yield call(create, payload)
      yield put({ type: 'query' })
      if (resp && resp.status === 200 && payload.sourceType === 'upload') {
        let canUpload = false
        // The reason for the delay is that the back-end upload service cannot be started immediately.
        // The interface opened by the service has not been checked for the time being.
        // So it needs to delay 60s temporarily
        for (let i = 0; i < 30; i++) {
          yield delay(2000)
          yield put({ type: 'query' })
          let data = yield select(state => state.backingImage.data)
          if (data && data.length > 0) {
            const currentBackingImage = data.find((item) => item.name === payload.name)
            if (currentBackingImage && currentBackingImage.diskFileStatusMap) {
              const diskMap = currentBackingImage.diskFileStatusMap
              canUpload = Object.keys(diskMap).some((key) => diskMap[key].state === 'pending')
              if (canUpload) {
                break
              }
            }
          }
        }
        if (callback) {
          !canUpload && message.error('Timeout waiting for the upload service initialization, please delete then recreate Backing Image.')
          callback(resp, canUpload)
        }
      } else {
        // When a creation error occurs, the notification that has been turned on must be terminated.
        payload.sourceType === 'upload' && notification.destroy()
      }
    },
    *openCreateBackingImageModal({
      payload,
    }, { call, put }) {
      yield put({ type: 'showCreateBackingImageModal' })
      const nodeTags = yield call(getNodeTags, payload)
      const diskTags = yield call(getDiskTags, payload)
      if (nodeTags.status === 200 && diskTags.status === 200) {
        yield put({ type: 'changeTagsLoading', payload: { nodeTags: nodeTags.data, diskTags: diskTags.data, tagsLoading: false } })
      } else {
        yield put({ type: 'changeTagsLoading', payload: { tagsLoading: false } })
      }
    },
    // restore bbi to bi
    *restoreBackingImage({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideRestoreBackingImageModal' })
      const restoreUrl = payload.item?.actions?.backupBackingImageRestore
      if (restoreUrl) {
        const resp = yield call(execAction, restoreUrl, payload.params)
        if (resp && resp.status === 200) {
          message.success(`Successfully restore ${payload.item.name} backing image`)
        }
        yield put({ type: 'query' })
      } else {
        message.error('Missing restore backup backing image url')
      }
    },
    *deleteBackupBackingImage({
      payload,
    }, { call, put }) {
      yield call(deleteBackupBackingImage, payload)
      yield delay(1000)
      yield put({ type: 'queryBackupBackingImage' })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteBackingImage, payload)
      yield put({ type: 'query' })
    },
    *updateMinCopiesCount({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateMinCopiesCountModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *downloadBackingImage({
      payload,
    }, { call, put }) {
      yield call(download, payload)
      yield put({ type: 'query' })
    },
    *bulkDeleteBackupBackingImage({
      payload,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteBackupBackingImage, item))
      }
      yield delay(3000)
      yield put({ type: 'queryBackupBackingImage' })
    },
    *bulkBackup({
      payload,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        for (const bi of payload) {
          const url = bi.actions.backupBackingImageCreate
          if (url) {
            yield call(execAction, url)
          }
        }
      }
      yield delay(3000)
      yield put({ type: 'queryBackupBackingImage' })
    },
    *bulkDownload({
      payload,
    }, { call }) {
      if (payload && payload.length > 0) {
        yield call(bulkDownload, payload)
      }
    },
    *bulkDelete({
      payload,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteBackingImage, item))
      }
      yield put({ type: 'query' })
    },
    *deleteDisksOnBackingImage({
      payload,
    }, { call, put }) {
      if (payload && payload.rows && payload.rows.length > 0) {
        yield put({ type: 'enableDiskStateMapDeleteLoading' })
        yield call(deleteDisksOnBackingImage, payload)
      }
      yield put({ type: 'disableDiskStateMapDeleteLoading' })
      yield put({ type: 'disableDiskStateMapDelete' })
      yield put({ type: 'hideDiskStateMapDetailModal' })
      yield put({
        type: 'changeDiskStateMapSelection',
        payload: {
          selectedDiskStateMapRowKeys: [],
          selectedDiskStateMapRows: [],
        },
      })
      yield put({ type: 'query' })
    },
    *singleInterfaceUpload({
      payload,
      callback,
    }, { call, put }) {
      // eslint-disable-next-line no-undef
      const formData = new FormData()
      const url = `${payload.url}&size=${payload.size}`
      yield put({ type: 'app/startBackingImageUpload' })
      formData.append('chunk', payload.file)
      let resp = yield call(uploadChunk, url, formData, {}, payload.onProgress)
      if (callback) callback()
      yield put({ type: 'app/resetbackingImageUploadPercent' })
      yield put({ type: 'app/stopBackingImageUpload' })
      if (resp && resp.code !== 200) {
        message.error(`Upload failed! please delete then recreate Backing Image. ${resp.data}`)
      }
    },
    *startWS({
      payload,
    }, { select }) {
      if (payload.type === 'backingimages') {
        const wsBi = yield select(state => state.backingImage.wsBi)
        if (wsBi) {
          wsBi.open()
        } else {
          wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
        }
      }
      if (payload.type === 'backupbackingimages') {
        const wsBbi = yield select(state => state.backingImage.wsBbi)
        if (wsBbi) {
          wsBbi.open()
        } else {
          wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
        }
      }
    },
    *stopWS({
      // eslint-disable-next-line no-unused-vars
      payload,
    }, { select }) {
      const wsBi = yield select(state => state.backingImage.wsBi)
      const wsBbi = yield select(state => state.backingImage.wsBbi)
      if (wsBi) wsBi.close(1000)
      if (wsBbi) wsBbi.close(1000)
    },
  },
  reducers: {
    queryBackingImage(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    setSearchFilter(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    setBackupBackingImage(state, action) {
      return { ...state, ...action.payload }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [], bbiSelectedRows: [] }
    },
    updateBackground(state, action) {
      return updateState(state, action)
    },
    updateBackgroundBBi(state, action) {
      if (action.payload && action.payload.data) {
        return {
          ...state,
          bbiData: action.payload.data || [],
        }
      } else {
        return {
          ...state,
        }
      }
    },
    showRestoreBackingImage(state, action) {
      return { ...state, ...action.payload, restoreBackupBackingImageModalVisible: true }
    },
    showCreateBackingImageModal(state, action) {
      return { ...state, ...action.payload, createBackingImageModalVisible: true, createBackingImageModalKey: Math.random() }
    },
    showUpdateMinCopiesCountModal(state, action) {
      return {
        ...state,
        minCopiesCountModalVisible: true,
        selected: action.payload,
      }
    },
    hideRestoreBackingImageModal(state, action) {
      return { ...state, ...action.payload, restoreBackupBackingImageModalVisible: false, bbiSelected: {} }
    },
    hideCreateBackingImageModal(state) {
      return { ...state, createBackingImageModalVisible: false }
    },
    showDiskStateMapDetailModal(state, action) {
      return {
        ...state,
        selected: action.payload.record,
        diskStateMapDetailModalVisible: true,
        diskStateMapDetailModalKey: Math.random(),
      }
    },
    hideUpdateMinCopiesCountModal(state) {
      return {
        ...state,
        minCopiesCountModalVisible: false,
        selected: {},
      }
    },
    hideDiskStateMapDetailModal(state) {
      return { ...state, diskStateMapDetailModalVisible: false, diskStateMapDetailModalKey: Math.random() }
    },
    disableDiskStateMapDelete(state) {
      return { ...state, diskStateMapDeleteDisabled: true }
    },
    enableDiskStateMapDelete(state) {
      return { ...state, diskStateMapDeleteDisabled: false }
    },
    disableDiskStateMapDeleteLoading(state) {
      return { ...state, diskStateMapDeleteLoading: false }
    },
    enableDiskStateMapDeleteLoading(state) {
      return { ...state, diskStateMapDeleteLoading: true }
    },
    changeDiskStateMapSelection(state, action) {
      return { ...state, ...action.payload }
    },
    changeTagsLoading(state, action) {
      return { ...state, ...action.payload }
    },
    updateSocketStatus(state, action) {
      return { ...state, biSocketStatus: action.payload }
    },
    updateWs(state, action) {
      return { ...state, wsBi: action.payload }
    },
    updateSocketStatusBbi(state, action) {
      return { ...state, bbiSocketStatus: action.payload }
    },
    updateWsBbi(state, action) {
      return { ...state, wsBbi: action.payload }
    },
  },
}

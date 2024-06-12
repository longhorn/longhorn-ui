import { queryBackupTarget, createBackupTarget, deleteBackupTarget, updateBackupTarget } from '../services/backupTarget'
import { message } from 'antd'
// import { delay } from 'dva/saga'
import { wsChanges, updateState } from '../utils/websocket'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'backupTarget',
  state: {
    data: [],
    resourceType: 'backupTarget',
    selectedRows: [],
    // createBackingImageModalVisible: false,
    // createBackingImageModalKey: Math.random(),
    // diskStateMapDetailModalVisible: false,
    // diskStateMapDetailModalKey: Math.random(),
    // diskStateMapDeleteDisabled: true,
    // diskStateMapDeleteLoading: false,
    // selectedDiskStateMapRows: [],
    // selectedDiskStateMapRowKeys: [],
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
      console.log('🚀 ~ data:', data)
      console.log('🚀 ~ backupTarget query data:', data)
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
      // console.log('🚀 ~ create resp:', resp)
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
      // console.log('🚀 ~edit  payload:', payload)
      yield call(updateBackupTarget, payload)
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
      console.log('🚀 ~ backupTarget startWS ws:', ws)
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
    // showCreateBackingImageModal(state, action) {
    //   return { ...state, ...action.payload, createBackingImageModalVisible: true, createBackingImageModalKey: Math.random() }
    // },
    // hideCreateBackingImageModal(state) {
    //   return { ...state, createBackingImageModalVisible: false }
    // },
    // showDiskStateMapDetailModal(state, action) {
    //   return {
    //     ...state,
    //     selected: action.payload.record,
    //     diskStateMapDetailModalVisible: true,
    //     diskStateMapDetailModalKey: Math.random(),
    //   }
    // },
    // hideDiskStateMapDetailModal(state) {
    //   return { ...state, diskStateMapDetailModalVisible: false, diskStateMapDetailModalKey: Math.random() }
    // },
    // disableDiskStateMapDelete(state) {
    //   return { ...state, diskStateMapDeleteDisabled: true }
    // },
    // enableDiskStateMapDelete(state) {
    //   return { ...state, diskStateMapDeleteDisabled: false }
    // },
    // disableDiskStateMapDeleteLoading(state) {
    //   return { ...state, diskStateMapDeleteLoading: false }
    // },
    // enableDiskStateMapDeleteLoading(state) {
    //   return { ...state, diskStateMapDeleteLoading: true }
    // },
    changeDiskStateMapSelection(state, action) {
      return { ...state, ...action.payload }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

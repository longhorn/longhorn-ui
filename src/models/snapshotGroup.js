import { query, get, create, preview, deleteSnapshotGroup } from '../services/snapshotGroup'
import { message } from 'antd'
import { wsChanges, updateState } from '../utils/websocket'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  ws: null,
  namespace: 'snapshotGroup',
  state: {
    data: [],
    resourceType: 'snapshotGroup',
    selected: null,
    selectedRows: [],
    previewData: [],
    previewLoading: false,
    createModalVisible: false,
    createModalKey: Math.random(),
    createModalError: '',
    deleteModalVisible: false,
    deleteModalKey: Math.random(),
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'snapshotGroup')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/snapshotGroup') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, payload)
      if (payload && payload.field && payload.keyword && data.data) {
        data.data = data.data.filter(item => item[payload.field] && item[payload.field].indexOf(payload.keyword.trim()) > -1)
      }
      if (data.data) {
        data.data.sort((a, b) => a.name.localeCompare(b.name))
      }
      yield put({ type: 'querySnapshotGroup', payload: { ...data } })
      yield put({ type: 'clearSelection' })
    },
    *get({
      payload,
    }, { call, put }) {
      const data = yield call(get, payload.name)
      if (data) {
        yield put({ type: 'setSelected', payload: data })
      }
    },
    *create({
      payload,
    }, { call, put }) {
      try {
        const resp = yield call(create, payload)
        if (resp && resp.status >= 200 && resp.status < 300) {
          message.success(`Successfully created snapshot group ${payload.name}.`)
          yield put({ type: 'hideCreateModal' })
          yield put({ type: 'query' })
        }
      } catch (error) {
        const errMsg = error?.message || error?.data?.message || 'Failed to create snapshot group'
        yield put({ type: 'setCreateModalError', payload: errMsg })
      }
    },
    *preview({
      payload,
    }, { call, put }) {
      yield put({ type: 'setPreviewLoading', payload: true })
      try {
        const resp = yield call(preview, payload)
        yield put({ type: 'setPreviewData', payload: resp?.members || [] })
      } catch (error) {
        yield put({ type: 'setPreviewData', payload: [] })
      }
      yield put({ type: 'setPreviewLoading', payload: false })
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteSnapshotGroup, payload)
      yield put({ type: 'query' })
    },
    *bulkDelete({
      payload,
    }, { call, put }) {
      if (payload && payload.length > 0) {
        yield payload.map(item => call(deleteSnapshotGroup, item))
      }
      yield put({ type: 'query' })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.snapshotGroup.ws)
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
      let ws = yield select(state => state.snapshotGroup.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    querySnapshotGroup(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    setSelected(state, action) {
      return { ...state, selected: action.payload }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [] }
    },
    showCreateModal(state, action) {
      return { ...state, ...action.payload, createModalError: '', createModalVisible: true, createModalKey: Math.random() }
    },
    hideCreateModal(state) {
      return { ...state, createModalVisible: false, previewData: [] }
    },
    setCreateModalError(state, action) {
      return { ...state, createModalError: action.payload }
    },
    showDeleteModal(state, action) {
      return { ...state, ...action.payload, deleteModalVisible: true, deleteModalKey: Math.random() }
    },
    hideDeleteModal(state) {
      return { ...state, deleteModalVisible: false }
    },
    setPreviewData(state, action) {
      return { ...state, previewData: action.payload }
    },
    setPreviewLoading(state, action) {
      return { ...state, previewLoading: action.payload }
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

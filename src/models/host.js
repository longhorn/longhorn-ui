import { query, toggleScheduling, updateDisk, deleteHost, getInstancemanagers } from '../services/host'
import { execAction } from '../services/volume'
import { wsChanges } from '../utils/websocket'
import { parse } from 'qs'
import { getSorter, saveSorter } from '../utils/store'
import queryString from 'query-string'

export default {
  namespace: 'host',
  state: {
    data: [],
    selected: {},
    selectedHostRows: [],
    selectedDiskID: '',
    selectedReplicaRows: [],
    selectedReplicaRowKeys: [],
    instanceManagerData: [],
    currentNode: {},
    modalVisible: false,
    addDiskModalVisible: false,
    replicaModalVisible: false,
    replicaModalDeleteDisabled: true,
    replicaModalDeleteLoading: false,
    editDisksModalVisible: false,
    diskReplicaModalVisible: false,
    instanceManagerVisible: false,
    editBulkNodesModalVisible: false,
    socketStatus: 'closed',
    sorter: getSorter('nodeList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: queryString.parse(location.search),
        })
      })
      wsChanges(dispatch, 'nodes', '1s')
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      if (data.data) {
        data.data.sort((a, b) => a.name.localeCompare(b.name))
      }
      yield put({ type: 'queryHost', payload: { ...data } })
    },
    *toggleScheduling({
      payload,
    }, { call, put }) {
      const data = {
        ...payload,
        allowScheduling: !payload.allowScheduling,
      }
      yield call(toggleScheduling, data)
      yield put({ type: 'query' })
    },
    *updateDisk({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideEditDisksModal' })
      if (payload.disableSchedulingDisks) {
        yield call(updateDisk, { disks: payload.disableSchedulingDisks }, payload.url)
      }
      yield call(toggleScheduling, payload.updateNode)
      yield call(updateDisk, { disks: payload.disks }, payload.url)
      yield put({ type: 'query' })
    },
    *deleteHost({
      payload,
    }, { call, put }) {
      const data = {
        ...payload,
      }
      yield call(deleteHost, data)
      yield put({ type: 'query' })
    },
    *deleteReplicas({
      replicas,
    }, { call, put }) {
      yield put({ type: 'replicaModalDeleteLoading' })
      yield replicas.map(replica => call(execAction, replica.removeUrl, { name: replica.name }))
      yield put({ type: 'replicaModalDeleteLoaded' })
      yield put({ type: 'clearReplicaSelection' })
    },
    *autoDeleteNode({
      payload,
    }, { call, put }) {
      if (payload && payload.selectedHostRows) {
        const hostList = payload.selectedHostRows.map((item) => Object.assign({}, item, { allowScheduling: false }))
        let replicas = []
        payload.selectedHostRows.forEach((item) => {
          item.replicas.forEach((ele) => {
            replicas.push(ele)
          })
        })
        yield hostList.map((item) => call(toggleScheduling, item))
        yield replicas.map(replica => call(execAction, replica.removeUrl, { name: replica.name }))
        yield hostList.map((item) => call(deleteHost, item))
        yield put({ type: 'query' })
      }
    },
    *getInstanceManagerModal({
      payload,
    }, { call, put }) {
      const dataSourch = yield call(getInstancemanagers)
      let currentData = []
      let replicaData = []
      let engineImageData = []
      if (dataSourch && dataSourch.data && dataSourch.data.length > 0) {
        currentData = dataSourch.data.filter((item) => {
          return item.nodeID === payload.id
        })
        replicaData = currentData.filter((item) => {
          return item.managerType === 'replica'
        })
        engineImageData = currentData.filter((item) => {
          return item.managerType === 'engine'
        })
        engineImageData.forEach((item) => {
          replicaData.forEach((ele) => {
            if (item.engineImage === ele.engineImage) {
              item.replicaCurrentState = ele.currentState
            }
          })
          if (!item.replicaCurrentState) {
            item.replicaCurrentState = ''
          }
        })
      }
      yield put({ type: 'setCurrentNode', payload })
      yield put({ type: 'showInstanceManagerModal', payload: engineImageData })
    },
    *changeBulkNodeScheduling({
      payload,
    }, { call, put }) {
      yield payload.selected.map(item => {
        const data = {
          ...item,
          allowScheduling: payload.allowScheduling,
        }
        return call(toggleScheduling, data)
      })
      yield put({ type: 'hideBulkEditNodeModal' })
      yield put({ type: 'query' })
    },
  },
  reducers: {
    queryHost(state, action) {
      let selectedHostRows = []

      if (action.payload && action.payload.data && action.payload.data) {
        selectedHostRows = action.payload.data.filter((item) => {
          return state.selectedHostRows.some((ele) => item.id === ele.id)
        })
      }

      return {
        ...state,
        ...action.payload,
        selectedHostRows,
      }
    },
    updateBackground(state, action) {
      const data = action.payload
      data.data = data.data || []
      return {
        ...state,
        ...data,
      }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    showModal(state, action) {
      return { ...state, ...action.payload, modalVisible: true }
    },
    hideModal(state) {
      return { ...state, modalVisible: false }
    },
    showAddDiskModal(state, action) {
      return { ...state, ...action.payload, addDiskModalVisible: true }
    },
    hideAddDiskModal(state) {
      return { ...state, addDiskModalVisible: false }
    },
    showInstanceManagerModal(state, action) {
      return { ...state, instanceManagerVisible: true, instanceManagerData: action.payload }
    },
    setCurrentNode(state, action) {
      return { ...state, instanceManagerVisible: true, currentNode: action.payload }
    },
    hideInstanceManagerModal(state) {
      return { ...state, instanceManagerVisible: false }
    },
    showReplicaModal(state, action) {
      return { ...state, ...action.payload, replicaModalVisible: true }
    },
    hideReplicaModal(state) {
      return { ...state, replicaModalVisible: false, selectedReplicaRows: [], selectedReplicaRowKeys: [] }
    },
    enableReplicaModalDelete(state) {
      return { ...state, replicaModalDeleteDisabled: false }
    },
    disableReplicaModalDelete(state) {
      return { ...state, replicaModalDeleteDisabled: true }
    },
    replicaModalDeleteLoading(state) {
      return { ...state, replicaModalDeleteLoading: true }
    },
    replicaModalDeleteLoaded(state) {
      return { ...state, replicaModalDeleteLoading: false }
    },
    showBulkEditNodeModal(state, action) {
      return { ...state, ...action.payload, editBulkNodesModalVisible: true }
    },
    hideBulkEditNodeModal(state) {
      return { ...state, editBulkNodesModalVisible: false }
    },
    showEditDisksModal(state, action) {
      return { ...state, ...action.payload, editDisksModalVisible: true }
    },
    hideEditDisksModal(state) {
      return { ...state, editDisksModalVisible: false }
    },
    showDiskReplicaModal(state, action) {
      return { ...state, ...action.payload, diskReplicaModalVisible: true }
    },
    hideDiskReplicaModal(state) {
      return { ...state, diskReplicaModalVisible: false, selectedReplicaRows: [], selectedReplicaRowKeys: [] }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateSorter(state, action) {
      saveSorter('nodeList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
    changeReplicaSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearReplicaSelection(state) {
      return { ...state, selectedReplicaRows: [], selectedReplicaRowKeys: [] }
    },
  },
}

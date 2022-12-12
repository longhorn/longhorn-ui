import { create, deleteVolume, query, execAction, createVolumePV, createVolumePVC, createVolumeAllPVC, volumeActivate, getNodeTags, getDiskTags, expandVolume, cancelExpansion, createRecurringJob, recurringJobAdd, getVolumeRecurringJobList, removeVolumeRecurringJob, updateRecurringJob } from '../services/volume'
import { query as getRecurringJob } from '../services/recurringJob'
import { wsChanges, updateState } from '../utils/websocket'
import { sortVolume } from '../utils/sort'
import { routerRedux } from 'dva/router'
import { getSorter, saveSorter } from '../utils/store'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  namespace: 'volume',
  state: {
    ws: null,
    data: [],
    resourceType: 'volume',
    selected: null,
    selectedRows: [],
    WorkloadDetailModalItem: {},
    volumeRecurringJobs: [],
    nodeTags: [],
    diskTags: [],
    recurringList: [],
    tagsLoading: true,
    createVolumeModalVisible: false,
    createPVCModalVisible: false,
    createPVModalVisible: false,
    createPVCAllModalVisible: false,
    createPVAndPVCSingleVisible: false,
    createPVAndPVCVisible: false,
    WorkloadDetailModalVisible: false,
    recurringJobModalVisible: false,
    attachHostModalVisible: false,
    bulkAttachHostModalVisible: false,
    engineUpgradeModalVisible: false,
    bulkEngineUpgradeModalVisible: false,
    updateReplicaCountModalVisible: false,
    recurringModalVisible: false,
    salvageModalVisible: false,
    nameSpaceDisabled: false,
    previousChecked: false,
    expansionVolumeSizeModalVisible: false,
    pvNameDisabled: false,
    changeVolumeModalVisible: false,
    bulkChangeVolumeModalVisible: false,
    bulkExpandVolumeModalVisible: false,
    updateBulkReplicaCountModalVisible: false,
    customColumnVisible: false,
    updateDataLocalityModalVisible: false,
    updateBulkDataLocalityModalVisible: false,
    updateAccessModeModalVisible: false,
    updateBulkAccessModeModalVisible: false,
    confirmModalWithWorkloadVisible: false,
    updateReplicaAutoBalanceModalVisible: false,
    unmapMarkSnapChainRemovedModalVisible: false,
    bulkUnmapMarkSnapChainRemovedModalVisible: false,
    updateSnapshotDataIntegrityModalVisible: false,
    updateBulkSnapshotDataIntegrityModalVisible: false,
    changeVolumeActivate: '',
    defaultPvOrPvcName: '',
    defaultNamespace: '',
    defaultPVName: '',
    defaultPVCName: '',
    previousNamespace: '',
    recurringJobList: [],
    changeVolumeModalKey: Math.random(),
    bulkChangeVolumeModalKey: Math.random(),
    bulkExpandVolumeModalKey: Math.random(),
    createPVAndPVCModalSingleKey: Math.random(),
    WorkloadDetailModalKey: Math.random(),
    recurringJobModalKey: Math.random(),
    createPVCAllModalKey: Math.random(),
    createVolumeModalKey: Math.random(),
    createPVAndPVCModalKey: Math.random(),
    createPVCModalKey: Math.random(),
    createPVModalKey: Math.random(),
    attachHostModalKey: Math.random(),
    bulkAttachHostModalKey: Math.random(),
    engineUpgradeModaKey: Math.random(),
    bulkEngineUpgradeModalKey: Math.random(),
    expansionVolumeSizeModalKey: Math.random(),
    updateReplicaCountModalKey: Math.random(),
    updateBulkReplicaCountModalKey: Math.random(),
    customColumnKey: Math.random(),
    updateDataLocalityModalKey: Math.random(),
    updateBulkDataLocalityModalKey: Math.random(),
    updateAccessModeModalKey: Math.random(),
    updateBulkAccessModeModalKey: Math.random(),
    confirmModalWithWorkloadKey: Math.random(),
    updateReplicaAutoBalanceModalKey: Math.random(),
    unmapMarkSnapChainRemovedModalKey: Math.random(),
    bulkUnmapMarkSnapChainRemovedModalKey: Math.random(),
    updateSnapshotDataIntegrityModalKey: Math.random(),
    updateBulkSnapshotDataIntegrityModalKey: Math.random(),
    socketStatus: 'closed',
    sorter: getSorter('volumeList.sorter'),
    customColumnList: window.__column__, // eslint-disable-line no-underscore-dangle
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'volume')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/volume') ? queryString.parse(location.search) : {},
          })
        }
        // Init recurringJobs to empty array
        dispatch({
          type: 'setVolumeRecurringJobs',
          payload: [],
        })
      })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, payload)
      if (payload && payload.field === 'id' && payload.keyword) {
        data.data = data.data.filter(item => item[payload.field].indexOf(payload.keyword) > -1)
      }
      if (payload && payload.field === 'host' && payload.keyword) {
        data.data = data.data.filter(item => item.controller && item.controller.hostId
          && payload.keyword.split(',').indexOf(item.controller.hostId) > -1)
      }
      sortVolume(data.data)
      yield put({ type: 'queryVolume', payload: { ...data } })
      yield put({ type: 'clearSelection' })
    },
    *engineUpgrade({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideEngineUpgradeModal' })
      yield call(execAction, payload.url, { image: payload.image })
      yield put({ type: 'query' })
    },
    *queryVolumeRecurringJobList({
      payload,
    }, { call, put }) {
      if (payload.actions && payload.actions.recurringJobList) {
        const recurringJobResp = yield call(getVolumeRecurringJobList, payload.actions.recurringJobList)
        if (recurringJobResp && recurringJobResp.data) {
          yield put({ type: 'setVolumeRecurringJobs', payload: recurringJobResp.data })
        }
      }
    },
    *rollback({
      payload,
    }, { call, put }) {
      yield call(execAction, payload.url, { image: payload.image })
      yield put({ type: 'query' })
    },
    *detach({
      payload,
    }, { call, put }) {
      yield call(execAction, payload.url)
      yield put({ type: 'query' })
    },
    *attach({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideAttachHostModal' })
      yield call(execAction, payload.url, { hostId: payload.host, disableFrontend: payload.disableFrontend })
      yield put({ type: 'query' })
    },
    *salvage({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideSalvageModal' })
      yield call(execAction, payload.url, { names: payload.replicaNames })
      yield put({ type: 'query' })
    },
    *create({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreateVolumeModal' })
      yield call(create, payload)
      yield put({ type: 'query' })
    },
    *showCreateVolumeModalBefore({
      payload,
    }, { call, put }) {
      yield put({ type: 'showCreateVolumeModal' })
      const nodeTags = yield call(getNodeTags, payload)
      const diskTags = yield call(getDiskTags, payload)
      if (nodeTags.status === 200 && diskTags.status === 200) {
        yield put({ type: 'changeTagsLoading', payload: { nodeTags: nodeTags.data, diskTags: diskTags.data, tagsLoading: false } })
      } else {
        yield put({ type: 'changeTagsLoading', payload: { tagsLoading: false } })
      }
    },
    *delete({
      payload,
    }, { call, put }) {
      yield call(deleteVolume, payload)
      yield put({ type: 'query' })
    },
    *deleteAndRedirect({
      payload,
    }, { call, put }) {
      yield call(deleteVolume, payload)
      yield put(routerRedux.push({
        pathname: '/volume',
      }))
    },
    *deleteReplicas({
      replicas,
    }, { call, put }) {
      yield replicas.map(replica => call(execAction, replica.removeUrl, { name: replica.name }))
      yield put({ type: 'query' })
    },
    *volumeActivate({
      payload,
    }, { call, put }) {
      yield call(volumeActivate, { frontend: payload.frontend }, payload.url)
      yield put({ type: 'hideChangeVolumeModal' })
      yield put({ type: 'query' })
    },
    *bulkVolumeActivate({
      payload,
    }, { call, put }) {
      yield payload.map((item) => call(volumeActivate, { frontend: item.frontend }, item.url))
      yield put({ type: 'hideBulkChangeVolumeModal' })
      yield put({ type: 'query' })
    },
    *actions({
      payload,
    }, { call }) {
      yield call(execAction, payload.url, payload.params)
      if (payload.callBack) { yield call(payload.callBack, '') }
    },
    *replicaCountUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateReplicaCountModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *bulkReplicaCountUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateBulkReplicaCountModal' })
      yield payload.urls.map(url => call(execAction, url, payload.params))
      yield put({ type: 'query' })
    },
    *updateUnmapMarkSnapChainRemoved({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateUnmapMarkSnapChainRemovedModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *updateBulkUnmapMarkSnapChainRemoved({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkUpdateUnmapMarkSnapChainRemovedModal' })
      if (payload?.urls?.length > 0) {
        for (let i = 0; i < payload.urls.length; i++) {
          yield call(execAction, payload.urls[i], payload.params)
        }
      }
      yield put({ type: 'query' })
    },
    *dataLocalityUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateDataLocalityModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *bulkDataLocalityUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateBulkDataLocalityModal' })
      yield payload.urls.map(url => call(execAction, url, payload.params))
      yield put({ type: 'query' })
    },
    *updateBulkSnapshotDataIntegrity({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateBulkSnapshotDataIntegrityModal' })
      yield payload.urls.map(url => call(execAction, url, payload.params))
      yield put({ type: 'query' })
    },
    *updateSnapshotDataIntegrity({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateSnapshotDataIntegrityModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *accessModeUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateAccessModeModal' })
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *bulkAccessModeUpdate({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateBulkAccessModeModal' })
      yield payload.urls.map(url => call(execAction, url, payload.params))
      yield put({ type: 'query' })
    },
    *updateReplicaAutoBalanceModal({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideUpdateReplicaAutoBalanceModal' })
      yield payload.urls.map(url => call(execAction, url, payload.params))
      yield put({ type: 'query' })
    },
    *bulkDelete({
      payload,
    }, { call, put }) {
      yield payload.map(item => call(deleteVolume, item))
      yield put({ type: 'query' })
    },
    *bulkEngineUpgrade({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkEngineUpgradeModal' })
      yield payload.urls.map(url => call(execAction, url, { image: payload.image }))
      yield put({ type: 'query' })
    },
    *bulkDetach({
      payload,
    }, { call, put }) {
      yield payload.map(url => call(execAction, url))
      yield put({ type: 'query' })
    },
    *bulkAttach({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideBulkAttachHostModal' })
      yield payload.urls.map(url => call(execAction, url, { hostId: payload.host, disableFrontend: payload.disableFrontend }))
      yield put({ type: 'query' })
    },
    *bulkBackup({
      payload,
    }, { put }) {
      yield payload.actions.map(item => put({ type: 'snapshotCreateThenBackup', payload: { snapshotCreateUrl: item.snapshotCreateUrl, snapshotBackupUrl: item.snapshotBackupUrl, labels: payload.labels } }))
      yield put({ type: 'query' })
    },
    *createPVAndPVC({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVAndPVCModal' })
      const pvAction = []
      let fsType = payload.params && payload.params.fsType ? payload.params.fsType : 'ext4'
      payload.action.forEach((item) => {
        if (!item.kubernetesStatus.pvName) {
          pvAction.push(item)
        }
      })
      yield pvAction.map(item => call(createVolumePV, { pvName: item.name, fsType }, item.actions.pvCreate))
      if (payload.params.createPvcChecked) {
        if (payload.params.previousChecked) {
          yield payload.action.map(item => {
            let namespace = payload.params.namespace
            let pvcname = item.name
            if (item.kubernetesStatus && item.kubernetesStatus.namespace) {
              namespace = item.kubernetesStatus.namespace
            }
            if (item.kubernetesStatus && item.kubernetesStatus.pvcName) {
              pvcname = item.kubernetesStatus.pvcName
            }
            return call(createVolumeAllPVC, namespace, pvcname, item.actions.pvcCreate)
          })
        } else {
          yield payload.action.map(item => {
            return call(createVolumeAllPVC, payload.params.namespace, item.name, item.actions.pvcCreate)
          })
        }
      }
      yield put({ type: 'query' })
    },
    *createPVAndPVCSingle({
      payload,
    }, { call, put }) {
      yield put({ type: 'hideCreatePVCAndPVSingleModal' })
      if (payload.selectedVolume && payload.selectedVolume.kubernetesStatus && !payload.selectedVolume.kubernetesStatus.pvName && payload.params && payload.params.pvName && payload.params.fsType) {
        let params = { pvName: payload.params.pvName, fsType: payload.params.fsType }
        if (payload.selectedVolume.encrypted) {
          Object.assign(params, { secretNamespace: payload.params.secretNamespace, secretName: payload.params.secretName })
        }
        yield call(createVolumePV, params, payload.selectedVolume.actions.pvCreate)
      }
      if (payload.params && payload.params.namespace && payload.params.pvcName) {
        let params = { pvcName: payload.params.pvcName, namespace: payload.params.namespace }
        yield call(createVolumePVC, params, payload.selectedVolume.actions.pvcCreate)
      }
      yield put({ type: 'query' })
    },
    *expandVolume({
      payload,
    }, { call, put }) {
      let params = {}
      yield put({ type: 'hideExpansionVolumeSizeModal' })
      if (payload && payload.selected && payload.selected.actions && payload.params) {
        params.url = payload.selected.actions.expand
        params.data = payload.params

        yield call(expandVolume, params)
      }
    },
    *cancelExpansion({
      payload,
    }, { call }) {
      if (payload && payload.actions && payload.actions.cancelExpansion && payload.name) {
        yield call(cancelExpansion, { url: payload.actions.cancelExpansion, name: payload.name })
      }
    },
    *bulkExpandVolume({
      payload,
    }, { call, put }) {
      let params = {}
      yield put({ type: 'hideBulkExpansionVolumeSizeModal' })
      if (payload && payload.selectedRows && payload.selectedRows.length > 0) {
        for (let i = 0; i < payload.selectedRows.length; i++) {
          if (payload.selectedRows[i] && payload.selectedRows[i].actions && payload.selectedRows[i].actions.expand && payload.params) {
            params.url = payload.selectedRows[i].actions.expand
            params.data = payload.params

            yield call(expandVolume, params)
          }
        }
      }
    },
    *snapshotCreateThenBackup({
      payload,
    }, { call }) {
      const snapshot = yield call(execAction, payload.snapshotCreateUrl, {})
      yield call(execAction, payload.snapshotBackupUrl, { name: snapshot.name, labels: payload.labels })
    },
    *createRecurringJob({
      payload,
    }, { call, put }) {
      let resp = yield call(createRecurringJob, payload.recurringJob)
      if (resp && resp.status === 200 && payload.selectedVolume.actions && payload.selectedVolume.actions.recurringJobAdd) {
        let url = payload.selectedVolume.actions.recurringJobAdd
        let params = {
          url,
          name: resp.name,
          isGroup: false,
        }
        let recurringJobResp = yield call(recurringJobAdd, params)
        if (recurringJobResp && recurringJobResp.data) {
          yield put({ type: 'recurringJob/query' })
          yield put({ type: 'queryVolumeRecurringJobList',
            payload: {
              ...payload.selectedVolume,
            },
          })
        }
      }
    },
    *updateRecurringJob({
      payload,
    }, { call, put }) {
      let resp = yield call(updateRecurringJob, payload.recurringJob)
      if (resp && resp.status === 200) {
        yield put({ type: 'recurringJob/query' })
        yield put({ type: 'queryVolumeRecurringJobList',
          payload: {
            ...payload.selectedVolume,
          },
        })
      }
    },
    *addRecurringJobGroupToVolume({
      payload,
    }, { call, put }) {
      if (payload.selectedVolume.actions && payload.selectedVolume.actions.recurringJobAdd) {
        let url = payload.selectedVolume.actions.recurringJobAdd
        let params = {
          url,
          name: payload.recurringJobGroup.name,
          isGroup: true,
        }
        let recurringJobResp = yield call(recurringJobAdd, params)
        if (recurringJobResp && recurringJobResp.data) {
          yield put({ type: 'queryVolumeRecurringJobList',
            payload: {
              ...payload.selectedVolume,
            },
          })
        }
      }
    },
    *addExistingRecurringJobToVolume({
      payload,
    }, { call, put }) {
      if (payload.selectedVolume.actions && payload.selectedVolume.actions.recurringJobAdd) {
        let url = payload.selectedVolume.actions.recurringJobAdd
        let params = {
          url,
          name: payload.recurringJob.name,
          isGroup: false,
        }
        let recurringJobResp = yield call(recurringJobAdd, params)
        if (recurringJobResp && recurringJobResp.data) {
          yield put({ type: 'queryVolumeRecurringJobList',
            payload: {
              ...payload.selectedVolume,
            },
          })
        }
      }
    },
    *removeVolumeRecurringJob({
      payload,
    }, { call, put }) {
      if (payload.selectedVolume && payload.selectedVolume.actions) {
        let recurringJobResp = yield call(removeVolumeRecurringJob, {
          url: payload.selectedVolume.actions.recurringJobDelete,
          name: payload.name,
          isGroup: payload.isGroup,
        })
        if (recurringJobResp && recurringJobResp.data) {
          yield put({ type: 'queryVolumeRecurringJobList',
            payload: {
              ...payload.selectedVolume,
            },
          })
        }
      }
    },
    *removeBulkVolumeRecurringJob({
      payload,
      callback,
    }, { call, put }) {
      if (payload.selectedVolume && payload.selectedVolume.actions && payload.selectedJobRows && payload.selectedJobRows.length) {
        for (let i = 0; i < payload.selectedJobRows.length; i++) {
          yield call(removeVolumeRecurringJob, {
            url: payload.selectedVolume.actions.recurringJobDelete,
            name: payload.selectedJobRows[i].name,
            isGroup: payload.isGroup,
          })
        }

        yield put({ type: 'queryVolumeRecurringJobList',
          payload: {
            ...payload.selectedVolume,
          },
        })
      }
      if (callback) callback()
    },
    *getRecurringJob({
      callback,
    }, { call }) {
      let recurringJobListResp = yield call(getRecurringJob)
      if (recurringJobListResp && recurringJobListResp.data) {
        if (callback) callback(recurringJobListResp.data)
      }
    },
    *trimFilesystem({
      payload,
    }, { call, put }) {
      yield call(execAction, payload.url, payload.params)
      yield put({ type: 'query' })
    },
    *trimBulkFilesystem({
      payload,
    }, { call, put }) {
      for (let i = 0; i < payload.urls.length; i++) {
        if (payload?.urls[i]) yield call(execAction, payload.urls[i], {})
      }
      yield put({ type: 'query' })
    },
    *startWS({
      payload,
    }, { select }) {
      let ws = yield select(state => state.volume.ws)
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
      let ws = yield select(state => state.volume.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    queryVolume(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateBackground(state, action) {
      return updateState(state, action)
    },
    showChangeVolumeModal(state, aciton) {
      return { ...state, changeVolumeActivate: aciton.payload, changeVolumeModalVisible: true, changeVolumeModalKey: Math.random() }
    },
    hideChangeVolumeModal(state) {
      return { ...state, changeVolumeActivate: '', changeVolumeModalVisible: false, changeVolumeModalKey: Math.random() }
    },
    showBulkChangeVolumeModal(state) {
      return { ...state, bulkChangeVolumeModalVisible: true, bulkChangeVolumeModalKey: Math.random() }
    },
    hideBulkChangeVolumeModal(state) {
      return { ...state, bulkChangeVolumeModalVisible: false, bulkChangeVolumeModalKey: Math.random() }
    },
    showCreateVolumeModal(state, action) {
      return { ...state, ...action.payload, createVolumeModalVisible: true, createVolumeModalKey: Math.random() }
    },
    showCustomColumnModal(state, action) {
      return { ...state, ...action.payload, customColumnVisible: true, customColumnKey: Math.random() }
    },
    hideCustomColumnModal(state, action) {
      return { ...state, ...action.payload, customColumnVisible: false }
    },
    changeTagsLoading(state, action) {
      return { ...state, ...action.payload }
    },
    showCreatePVAndPVCModal(state, action) {
      return { ...state, createPVAndPVCVisible: true, selectedRows: action.payload, createPVAndPVCModalKey: Math.random() }
    },
    showCreatePVCAndPVSingleModal(state, action) {
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.pvcName ? state.defaultPVCName = action.payload.kubernetesStatus.pvcName : state.defaultPVCName = action.payload.name
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.pvName ? state.defaultPVName = action.payload.kubernetesStatus.pvName : state.defaultPVName = action.payload.name
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.pvName ? state.pvNameDisabled = true : state.pvNameDisabled = false
      action.payload.kubernetesStatus && action.payload.kubernetesStatus.lastPVCRefAt ? state.previousNamespace = action.payload.kubernetesStatus.namespace : state.previousNamespace = ''
      return { ...state, nameSpaceDisabled: false, previousChecked: !!(action.payload.kubernetesStatus && action.payload.kubernetesStatus.lastPVCRefAt), pvNameDisabled: state.pvNameDisabled, previousNamespace: state.previousNamespace, createPVAndPVCSingleVisible: true, defaultPVCName: state.defaultPVCName, defaultPVName: state.defaultPVName, selected: action.payload, createPVAndPVCModalSingleKey: Math.random() }
    },
    changeCheckbox(state) {
      return { ...state, nameSpaceDisabled: !state.nameSpaceDisabled, previousChecked: !state.nameSpaceDisabled ? false : state.previousChecked }
    },
    setVolumeRecurringJobs(state, action) {
      return { ...state, volumeRecurringJobs: action.payload }
    },
    setPreviousChange(state, action) {
      return { ...state, previousChecked: action.payload }
    },
    hideCreatePVCAndPVSingleModal(state) {
      return { ...state, createPVAndPVCSingleVisible: false, pvNameDisabled: false, previousChecked: false, createPVAndPVCModalSingleKey: Math.random() }
    },
    hideCreatePVAndPVCModal(state) {
      return { ...state, createPVAndPVCVisible: false, nameSpaceDisabled: false, previousChecked: false, createPVAndPVCModalKey: Math.random() }
    },
    hideCreateVolumeModal(state) {
      return { ...state, createVolumeModalVisible: false, tagsLoading: true }
    },
    showExpansionVolumeSizeModal(state, action) {
      return { ...state, selected: action.payload, expansionVolumeSizeModalVisible: true, expansionVolumeSizeModalKey: Math.random() }
    },
    hideExpansionVolumeSizeModal(state) {
      return { ...state, expansionVolumeSizeModalVisible: false, expansionVolumeSizeModalKey: Math.random() }
    },
    hideBulkExpansionVolumeSizeModal(state) {
      return { ...state, bulkExpandVolumeModalVisible: false, bulkExpandVolumeModalKey: Math.random() }
    },
    showWorkloadDetailModal(state, action) {
      return { ...state, WorkloadDetailModalVisible: true, WorkloadDetailModalItem: action.payload, WorkloadDetailModalKey: Math.random() }
    },
    hideWorkloadDetailModal(state) {
      return { ...state, WorkloadDetailModalVisible: false, WorkloadDetailModalKey: Math.random() }
    },
    showRecurringJobModal(state, action) {
      return { ...state, recurringJobModalVisible: true, selected: action.payload, volumeRecurringJobs: [], recurringJobModalKey: Math.random() }
    },
    hideRecurringJobModal(state) {
      return { ...state, recurringJobModalVisible: false, recurringJobModalKey: Math.random() }
    },
    showAttachHostModal(state, action) {
      return { ...state, ...action.payload, attachHostModalVisible: true, attachHostModalKey: Math.random() }
    },
    showBulkAttachHostModal(state, action) {
      return { ...state, ...action.payload, bulkAttachHostModalVisible: true, bulkAttachHostModalKey: Math.random() }
    },
    hideAttachHostModal(state) {
      return { ...state, attachHostModalVisible: false }
    },
    hideBulkAttachHostModal(state) {
      return { ...state, bulkAttachHostModalVisible: false }
    },
    showEngineUpgradeModal(state, action) {
      return { ...state, ...action.payload, engineUpgradeModalVisible: true, engineUpgradeModaKey: Math.random() }
    },
    showBulkEngineUpgradeModal(state, action) {
      return { ...state, ...action.payload, bulkEngineUpgradeModalVisible: true, bulkEngineUpgradeModalKey: Math.random() }
    },
    hideEngineUpgradeModal(state) {
      return { ...state, engineUpgradeModalVisible: false }
    },
    hideBulkEngineUpgradeModal(state) {
      return { ...state, bulkEngineUpgradeModalVisible: false }
    },
    showRecurringModal(state, action) {
      return { ...state, ...action.payload, recurringModalVisible: true }
    },
    hideRecurringModal(state) {
      return { ...state, recurringModalVisible: false }
    },
    showSalvageModal(state, action) {
      return { ...state, ...action.payload, salvageModalVisible: true }
    },
    hideSalvageModal(state) {
      return { ...state, salvageModalVisible: false }
    },
    showUpdateReplicaCountModal(state, action) {
      return { ...state, ...action.payload, updateReplicaCountModalVisible: true, updateReplicaCountModalKey: Math.random() }
    },
    showUpdateDataLocality(state, action) {
      return { ...state, ...action.payload, updateDataLocalityModalVisible: true, updateDataLocalityModalKey: Math.random() }
    },
    showUnmapMarkSnapChainRemovedModal(state, action) {
      return { ...state, ...action.payload, unmapMarkSnapChainRemovedModalVisible: true, unmapMarkSnapChainRemovedModalKey: Math.random() }
    },
    hideUpdateUnmapMarkSnapChainRemovedModal(state, action) {
      return { ...state, ...action.payload, unmapMarkSnapChainRemovedModalVisible: false, unmapMarkSnapChainRemovedModalKey: Math.random() }
    },
    showBulkUnmapMarkSnapChainRemovedModal(state, action) {
      return { ...state, ...action.payload, bulkUnmapMarkSnapChainRemovedModalVisible: true, bulkUnmapMarkSnapChainRemovedModalKey: Math.random() }
    },
    hideBulkUpdateUnmapMarkSnapChainRemovedModal(state, action) {
      return { ...state, ...action.payload, bulkUnmapMarkSnapChainRemovedModalVisible: false, bulkUnmapMarkSnapChainRemovedModalKey: Math.random() }
    },
    showUpdateSnapshotDataIntegrityModal(state, action) {
      return { ...state, ...action.payload, updateSnapshotDataIntegrityModalVisible: true, updateSnapshotDataIntegrityModalKey: Math.random() }
    },
    showUpdateBulkSnapshotDataIntegrityModal(state, action) {
      return { ...state, ...action.payload, updateBulkSnapshotDataIntegrityModalVisible: true, updateBulkSnapshotDataIntegrityModalKey: Math.random() }
    },
    showUpdateAccessMode(state, action) {
      return { ...state, ...action.payload, updateAccessModeModalVisible: true, updateAccessModeModalKey: Math.random() }
    },
    showUpdateBulkReplicaCountModal(state, action) {
      return { ...state, ...action.payload, updateBulkReplicaCountModalVisible: true, updateBulkReplicaCountModalKey: Math.random() }
    },
    showUpdateBulkDataLocalityModal(state, action) {
      return { ...state, ...action.payload, updateBulkDataLocalityModalVisible: true, updateBulkDataLocalityModalKey: Math.random() }
    },
    showUpdateBulkAccessModeModal(state, action) {
      return { ...state, ...action.payload, updateBulkAccessModeModalVisible: true, updateBulkAccessModeModalKey: Math.random() }
    },
    hideUpdateReplicaCountModal(state) {
      return { ...state, updateReplicaCountModalVisible: false }
    },
    hideUpdateBulkReplicaCountModal(state, action) {
      return { ...state, ...action.payload, updateBulkReplicaCountModalVisible: false }
    },
    hideUpdateBulkDataLocalityModal(state) {
      return { ...state, updateBulkDataLocalityModalVisible: false }
    },
    hideUpdateSnapshotDataIntegrityModal(state) {
      return { ...state, updateSnapshotDataIntegrityModalVisible: false }
    },
    hideUpdateBulkSnapshotDataIntegrityModal(state, action) {
      return { ...state, ...action.payload, updateBulkSnapshotDataIntegrityModalVisible: false, updateBulkSnapshotDataIntegrityModalKey: Math.random() }
    },
    hideUpdateBulkAccessModeModal(state) {
      return { ...state, updateBulkAccessModeModalVisible: false }
    },
    hideUpdateDataLocalityModal(state) {
      return { ...state, updateDataLocalityModalVisible: false }
    },
    hideUpdateAccessModeModal(state) {
      return { ...state, updateAccessModeModalVisible: false }
    },
    showBulkExpandVolumeModal(state, action) {
      return { ...state, bulkExpandVolumeModalVisible: true, selectedRows: action.payload, bulkExpandVolumeModalKey: Math.random() }
    },
    showUpdateReplicaAutoBalanceModal(state, action) {
      return { ...state, ...action.payload, updateReplicaAutoBalanceModalVisible: true, updateReplicaAutoBalanceModalKey: Math.random() }
    },
    hideUpdateReplicaAutoBalanceModal(state) {
      return { ...state, updateReplicaAutoBalanceModalVisible: false }
    },
    changeSelection(state, action) {
      return { ...state, ...action.payload }
    },
    clearSelection(state) {
      return { ...state, selectedRows: [] }
    },
    recurringBulkUpdate(state, action) {
      return { ...state, recurringList: action.payload.recurring }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateSorter(state, action) {
      saveSorter('volumeList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
    changeColumns(state, action) {
      if (action && action.payload && action.payload.columns) {
        window.sessionStorage.setItem('customColumnList', JSON.stringify(action.payload.columns))
      }
      return { ...state, customColumnList: action.payload.columns }
    },
    showConfirmDetachWithWorkload(state) {
      return { ...state, confirmModalWithWorkloadVisible: true, confirmModalWithWorkloadKey: Math.random() }
    },
    hideConfirmDetachWithWorkload(state) {
      return { ...state, confirmModalWithWorkloadVisible: false, confirmModalWithWorkloadKey: Math.random() }
    },
    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

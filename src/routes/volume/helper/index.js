export function isSchedulingFailure(volume) {
  // volume.conditions.scheduled.status may be equal to 'Unknown' or 'True' or 'False', only 'False' value is scheduling failure
  // volume.conditions may be empty object({})
  return volume.conditions && volume.conditions.Scheduled && volume.conditions.Scheduled.status.toLowerCase() === 'false'
}

export function getAttachHostModalProps(volumes, hosts, visible, dispatch) {
  return {
    items: volumes,
    visible,
    hosts,
    onOk(selectedHost, disableFrontend, urls) {
      dispatch({
        type: 'volume/attach',
        payload: {
          host: selectedHost,
          disableFrontend,
          url: urls[0],
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideAttachHostModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getDetachHostModalProps(volumes, visible, dispatch) {
  return {
    items: volumes,
    visible,
    onOk(record) {
      dispatch({
        type: 'volume/detach',
        payload: record,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideDetachHostModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getEngineUpgradeModalProps(volumes, engineImages, engineUpgradePerNodeLimit, visible, dispatch) {
  return {
    items: volumes,
    visible,
    engineImages,
    engineUpgradePerNodeLimit,
    onOk(image, urls) {
      dispatch({
        type: 'volume/engineUpgrade',
        payload: {
          image,
          url: urls[0],
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideEngineUpgradeModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getBulkEngineUpgradeModalProps(volumes, engineImages, engineUpgradePerNodeLimit, visible, dispatch) {
  return {
    items: volumes,
    visible,
    engineImages,
    engineUpgradePerNodeLimit,
    onOk(image, urls) {
      dispatch({
        type: 'volume/bulkEngineUpgrade',
        payload: {
          image,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideBulkEngineUpgradeModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateBulkReplicaCountModalProps(volumes, visible, dispatch) {
  return {
    items: volumes,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/bulkReplicaCountUpdate',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateBulkReplicaCountModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateReplicaCountModalProps(volume, visible, dispatch) {
  return {
    item: volume,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/replicaCountUpdate',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateReplicaCountModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateSnapshotMaxCountModalProps(volume, visible, dispatch) {
  return {
    item: volume,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/snapshotMaxCountUpdate',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateSnapshotMaxCountModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateSnapshotMaxSizeModalProps(volume, visible, dispatch) {
  return {
    item: volume,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/snapshotMaxSizeUpdate',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateSnapshotMaxSizeModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateDataLocalityModalProps(volume, visible, defaultDataLocalityOption, dispatch) {
  let option = []

  if (defaultDataLocalityOption && defaultDataLocalityOption.length > 0) {
    option = defaultDataLocalityOption
  }

  return {
    item: volume,
    option,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/dataLocalityUpdate',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateDataLocalityModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUnmapMarkSnapChainRemovedModalProps(volume, visible, dispatch) {
  let option = [
    { key: 'enabled', value: 'enabled' },
    { key: 'disabled', value: 'disabled' },
    { key: 'ignored (follow the global setting)', value: 'ignored' },
  ]

  return {
    item: volume,
    option,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/updateUnmapMarkSnapChainRemoved',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateUnmapMarkSnapChainRemovedModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateSnapshotDataIntegrityProps(volume, visible, defaultSnapshotDataIntegrityOption, dispatch) {
  let options = []

  if (defaultSnapshotDataIntegrityOption && defaultSnapshotDataIntegrityOption.length > 0) {
    options = defaultSnapshotDataIntegrityOption
  }

  return {
    item: volume,
    options,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/updateSnapshotDataIntegrity',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateSnapshotDataIntegrityModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getBulkUnmapMarkSnapChainRemovedModalProps(volumes, visible, dispatch) {
  let option = [
    { key: 'enabled', value: 'enabled' },
    { key: 'disabled', value: 'disabled' },
    { key: 'ignored (follow the global setting)', value: 'ignored' },
  ]

  return {
    items: volumes,
    option,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/updateBulkUnmapMarkSnapChainRemoved',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideBulkUpdateUnmapMarkSnapChainRemovedModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateBulkSnapshotDataIntegrityModalProps(volumes, visible, defaultSnapshotDataIntegrityOption, dispatch) {
  let options = []

  if (defaultSnapshotDataIntegrityOption && defaultSnapshotDataIntegrityOption.length > 0) {
    options = defaultSnapshotDataIntegrityOption
  }

  return {
    items: volumes,
    options,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/updateBulkSnapshotDataIntegrity',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateBulkSnapshotDataIntegrityModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateBulkDataLocalityModalProps(volumes, visible, defaultDataLocalityOption, dispatch) {
  let option = []

  if (defaultDataLocalityOption && defaultDataLocalityOption.length > 0) {
    option = defaultDataLocalityOption
  }

  return {
    items: volumes,
    option,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/bulkDataLocalityUpdate',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateBulkDataLocalityModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateFreezeFilesystemForSnapshotModalProps(volume, visible, dispatch) {
  let option = [
    { key: 'enabled', value: 'enabled' },
    { key: 'disabled', value: 'disabled' },
    { key: 'ignored (follow the global setting)', value: 'ignored' },
  ]

  return {
    item: volume,
    option,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/updateFreezeFilesystemForSnapshot',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateFreezeFilesystemForSnapshotModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateBulkFreezeFilesystemForSnapshotModalProps(volumes, visible, dispatch) {
  const option = [
    { key: 'enabled', value: 'enabled' },
    { key: 'disabled', value: 'disabled' },
    { key: 'ignored (follow the global setting)', value: 'ignored' },
  ]

  return {
    items: volumes,
    option,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/updateBulkFreezeFilesystemForSnapshot',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateBulkFreezeFilesystemForSnapshotModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateAccessModeModalProps(volume, visible, dispatch) {
  return {
    item: volume,
    visible,
    onOk(v, url) {
      dispatch({
        type: 'volume/accessModeUpdate',
        payload: {
          params: v,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateAccessModeModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateBulkAccessModeModalProps(volumes, visible, dispatch) {
  return {
    items: volumes,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/bulkAccessModeUpdate',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateBulkAccessModeModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateReplicaAutoBalanceModalProps(volumes, visible, dispatch) {
  return {
    items: volumes,
    visible,
    onOk(v, urls) {
      dispatch({
        type: 'volume/updateReplicaAutoBalanceModal',
        payload: {
          params: v,
          urls,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateReplicaAutoBalanceModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
}

export function getUpdateReplicaSoftAntiAffinityModalProps(volume, volumes, updateReplicaSoftAntiAffinityVisible, softAntiAffinityKey, dispatch) {
  let replicaSoftAntiAffinityVolumes = []
  let fields = {}
  switch (softAntiAffinityKey) {
    case 'updateReplicaSoftAntiAffinity':
      fields = {
        actionKey: 'updateReplicaSoftAntiAffinity',
        key: 'replicaSoftAntiAffinity',
        name: 'Replica Soft Anti Affinity',
      }
      replicaSoftAntiAffinityVolumes = [volume]
      break
    case 'updateBulkReplicaSoftAntiAffinity':
      fields = {
        actionKey: 'updateReplicaSoftAntiAffinity',
        key: 'replicaSoftAntiAffinity',
        name: 'Replica Soft Anti Affinity',
      }
      replicaSoftAntiAffinityVolumes = volumes
      break
    case 'updateReplicaZoneSoftAntiAffinity':
      fields = {
        actionKey: 'updateReplicaZoneSoftAntiAffinity',
        key: 'replicaZoneSoftAntiAffinity',
        name: 'Replica Zone Soft Anti Affinity',
      }
      replicaSoftAntiAffinityVolumes = [volume]
      break
    case 'updateBulkReplicaZoneSoftAntiAffinity':
      fields = {
        actionKey: 'updateReplicaZoneSoftAntiAffinity',
        key: 'replicaZoneSoftAntiAffinity',
        name: 'Replica Zone Soft Anti Affinity',
      }
      replicaSoftAntiAffinityVolumes = volumes
      break
    case 'updateReplicaDiskSoftAntiAffinity':
      fields = {
        actionKey: 'updateReplicaDiskSoftAntiAffinity',
        key: 'replicaDiskSoftAntiAffinity',
        name: 'Replica Disk Soft Anti Affinity',
      }
      replicaSoftAntiAffinityVolumes = [volume]
      break
    case 'updateBulkReplicaDiskSoftAntiAffinity':
      fields = {
        actionKey: 'updateReplicaDiskSoftAntiAffinity',
        key: 'replicaDiskSoftAntiAffinity',
        name: 'Replica Disk Soft Anti Affinity',
      }
      replicaSoftAntiAffinityVolumes = volumes
      break
    default:
  }
  return {
    items: replicaSoftAntiAffinityVolumes,
    visible: updateReplicaSoftAntiAffinityVisible,
    onCancel() {
      dispatch({
        type: 'volume/hideUpdateReplicaSoftAntiAffinityModal',
      })
    },
    onOk(v, urls) {
      dispatch({
        type: 'volume/updateReplicaSoftAntiAffinityModal',
        payload: {
          params: v,
          urls,
        },
      })
      dispatch({
        type: 'volume/hideUpdateReplicaSoftAntiAffinityModal',
      })
    },
    options: [
      { value: 'enabled', label: 'enabled' },
      { value: 'disabled', label: 'disabled' },
      { value: 'ignored', label: 'ignored (follow the global setting)' },
    ],
    fields,
  }
}

export function getHealthState(state) {
  return state.toLowerCase() === 'unknown' ? 'unknown' : state.hyphenToHump()
}

export function needToWaitDone(state, replicas) {
  return state === '' || state.endsWith('ing') || replicas.findIndex(item => item.mode.toLowerCase() === 'wo') > -1
}

export const frontends = [
  { label: 'Block Device', value: 'blockdev' },
  { label: 'iSCSI', value: 'iscsi' },
]

export function disabledSnapshotAction(volume, modelState) {
  return !volume.actions || !volume.actions.snapshotCreate || !modelState || volume.currentImage !== volume.image || volume.standby
}

export function extractImageVersion(image) {
  return image.substr(image.lastIndexOf(':') + 1, image.length)
}

export function isRestoring(volume) {
  if (volume.restoreStatus && volume.restoreStatus.length > 0) {
    return volume.restoreStatus.some((item) => {
      return item.isRestoring
    })
  }
  return false
}

export function detachable(volume) {
  if (volume.standby || isRestoring(volume)) {
    return false
  }
  if (volume.accessMode === 'rwx') {
    if (volume.migratable) {
      return volume.state === 'attached' && volume.controllers && volume.controllers.length <= 1
    }
    return volume.state === 'attached' && volume.disableFrontend
  }

  return volume.state === 'attached'
}

export function attachable(volume) {
  if (isRestoring(volume)) {
    return false
  }
  return volume.state === 'detached'
}

export function groupBy(objectArray, property) {
  return objectArray.reduce((acc, obj) => {
    let key = obj[property]
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(obj)
    return acc
  }, {})
}

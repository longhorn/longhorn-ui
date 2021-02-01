export function isSchedulingFailure(volume) {
  // volume.conditions.scheduled.status may be equal to 'Unknown' or 'True' or 'False', only 'False' value is scheduling failure
  // volume.conditions may be empty object({})
  return volume.conditions && volume.conditions.scheduled && volume.conditions.scheduled.status.toLowerCase() === 'false'
}

export function genAttachHostModalProps(volumes, hosts, visible, dispatch) {
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
  return !volume.actions || !volume.actions.snapshotCreate || !modelState || volume.currentImage !== volume.engineImage || volume.standby
}

export function extractImageVersion(image) {
  return image.substr(image.lastIndexOf(':') + 1, image.length)
}

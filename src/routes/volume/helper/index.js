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

export function getEngineUpgradeModalProps(volumes, engineImages, visible, dispatch) {
  return {
    items: volumes,
    visible,
    engineImages,
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

import React from 'react'
import { Tooltip, Icon } from 'antd'

export function statusUpgradingEngine(volume) {
  if (volume && volume.image && volume.currentImage && volume.image !== volume.currentImage) {
    return (<Tooltip title={`Volume engine is being upgraded from ${volume.currentImage} to ${volume.image}`}><Icon style={{ marginRight: 5 }} type="sync" spin /></Tooltip>)
  }
  return ''
}

/** Check if any of the disk is in a ready state.
 * @param {*} data v1/backingimages response object.
 * @returns {boolean} true if any disk is ready.
 */
export function hasReadyBackingDisk(data) {
  try {
    return Object.keys(data.diskFileStatusMap).some(
      (key) => data.diskFileStatusMap[key]?.state === 'ready'
    )
  } catch (error) {
    return false
  }
}
// backing image disk status
export const diskStatusColorMap = {
  ready: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' }, // green
  starting: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  pending: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  'in-progress': { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  'ready-for-transfer': { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  'failed-and-cleanup': { color: '#F15354', bg: 'rgba(241,83,84,.05)' }, // red
  failed: { color: '#F15354', bg: 'rgba(241,83,84,.05)' }, // red
}

// node status
export const nodeStatusColorMap = {
  schedulable: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' }, // green
  unschedulable: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  // autoEvicting nodes are a subset of unschedulable nodes. We use the same color to represent both.
  autoEvicting: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' }, // yellow
  down: { color: '#F15354', bg: 'rgba(241,83,84,.1)' }, // red
  disabled: { color: '#dee1e3', bg: 'rgba(222,225,227,.05)' }, // grey
  unknown: { color: '#F15354', bg: 'rgba(241,83,84,.05)' }, // red
}

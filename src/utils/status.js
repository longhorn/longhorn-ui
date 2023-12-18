import React from 'react'
import { Tooltip, Icon } from 'antd'

export function statusUpgradingEngine(volume) {
  if (volume && volume.engineImage && volume.currentImage && volume.engineImage !== volume.currentImage) {
    return (<Tooltip title={`Volume engine is being upgraded from ${volume.currentImage} to ${volume.engineImage}`}><Icon style={{ marginRight: 5 }} type="sync" spin /></Tooltip>)
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

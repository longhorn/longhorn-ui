import React from 'react'
import { Tooltip } from 'antd'
import { SyncOutlined } from '@ant-design/icons'

export function statusUpgradingEngine(volume) {
  if (volume && volume.image && volume.currentImage && volume.image !== volume.currentImage) {
    return (<Tooltip title={`Volume engine is being upgraded from ${volume.currentImage} to ${volume.image}`}><SyncOutlined style={{ marginRight: 5 }} spin /></Tooltip>)
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

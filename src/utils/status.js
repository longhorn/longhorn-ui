import React from 'react'
import { Tooltip, Icon } from 'antd'

export function statusUpgradingEngine(volume) {
  if (volume && volume.image && volume.currentImage && volume.image !== volume.currentImage) {
    return (<Tooltip title={`Volume engine is being upgraded from ${volume.currentImage} to ${volume.image}`}><Icon style={{ marginRight: 5 }} type="sync" spin /></Tooltip>)
  }
  return ''
}

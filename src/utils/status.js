import React from 'react'
import { Tooltip, Icon } from 'antd'

export function statusUpgradingEngine(volume) {
  if (volume && volume.engineImage && volume.currentImage && volume.engineImage !== volume.currentImage) {
    return (<Tooltip title={`Volume engine is being upgraded from ${volume.currentImage} to ${volume.engineImage}`}><Icon style={{ marginRight: 5 }} type="sync" spin /></Tooltip>)
  }
  return ''
}

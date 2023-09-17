import React from 'react'
import { Tooltip } from 'antd'
import { SyncOutlined } from '@ant-design/icons'

export function statusUpgradingEngine(volume) {
  if (volume && volume.engineImage && volume.currentImage && volume.engineImage !== volume.currentImage) {
    return (<Tooltip title={`Volume engine is being upgraded from ${volume.currentImage} to ${volume.engineImage}`}><SyncOutlined style={{ marginRight: 5 }} spin /></Tooltip>)
  }
  return ''
}

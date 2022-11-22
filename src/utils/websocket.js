import React from 'react'
import { Tooltip } from 'antd'
import RobustWebSocket from 'robust-websocket'
import wsClosed from '../assets/images/ws-closed.svg'
import wsConnecting from '../assets/images/ws-connecting.svg'
import wsError from '../assets/images/ws-error.svg'
import wsOpen from '../assets/images/ws-open.svg'

export function constructWebsocketURL(type, period) {
  let loc = window.location

  let proto = 'ws:'
  if (loc.protocol === 'https:') {
    proto = 'wss:'
  }

  let prefix = window.__pathname_prefix__ // eslint-disable-line no-underscore-dangle

  return `${proto}//${loc.host}${prefix}${prefix.endsWith('/') ? '' : '/'}v1/ws/${period}/${type}`
}

export function wsChanges(dispatch, type, period, ns, search) {
  const url = constructWebsocketURL(type, period)
  const options = {
    timeout: 4000,
    shouldReconnect: function(event, ws) {
      if (event.code === 1008 || event.code === 1011) return
      return [0, 3000, 10000][ws.attempts]
    },
    automaticOpen: true,
  }
  // To do. Because two ws connections will be maintained under backup ns.
  const backupType = type ? type : ''
  const rws = new RobustWebSocket(url, [], options)
  if (ns === 'backup') {
    if (backupType === 'backupvolumes') {
      dispatch({ type: `${ns}/updateSocketStatusBackupVolumes`, payload: 'connecting' })
      dispatch({ type: `${ns}/updateWsBackupVolumes`, payload: rws })
    }
    if (backupType === 'backups') {
      dispatch({ type: `${ns}/updateSocketStatusBackups`, payload: 'connecting' })
      dispatch({ type: `${ns}/updateWsBackups`, payload: { rws, search }})
    }
  } else if (ns === 'systemBackups') {
    if (backupType === 'systembackups') {
      dispatch({ type: `${ns}/updateSocketStatusSysteBackups`, payload: 'connecting' })
      dispatch({ type: `${ns}/updateWsSystemBackups`, payload: rws })
    }
    if (backupType === 'systemrestores') {
      dispatch({ type: `${ns}/updateSocketStatusSystemRestores`, payload: 'connecting' })
      dispatch({ type: `${ns}/updateWsSystemRestores`, payload: rws })
    }
  } else {
    dispatch({ type: `${ns}/updateSocketStatus`, payload: 'connecting' })
    dispatch({ type: `${ns}/updateWs`, payload: rws })
  }
  let recentWrite = true
  let expectError = false
  window.setInterval(() => {
    if (rws.readyState === rws.OPEN) {
      if (!recentWrite) {
        rws.close(1000, '', { delay: 0 })
        expectError = true
      }
      recentWrite = !recentWrite
    }
  }, 30000)

  rws.addEventListener('message', (msg) => {
    recentWrite = true
    if (ns === 'backup') {
      if (backupType === 'backupvolumes') dispatch({
        type: `${ns}/updateBackgroundBackupVolumes`,
        payload: JSON.parse(msg.data),
      })
      if (backupType === 'backups') dispatch({
        type: `${ns}/updateBackgroundBackups`,
        payload: JSON.parse(msg.data),
      })
    } else if (ns === 'systemBackups') {
      if (backupType === 'systembackups') dispatch({
        type: `${ns}/updateBackgroundSystemBackups`,
        payload: JSON.parse(msg.data),
      })
      if (backupType === 'systemrestores') dispatch({
        type: `${ns}/updateBackgroundSystemrestores`,
        payload: JSON.parse(msg.data),
      })
    } else {
      dispatch({
        type: `${ns}/updateBackground`,
        payload: JSON.parse(msg.data),
      })
    }
  })
  rws.addEventListener('open', () => {
    if (ns === 'backup') {
      if (backupType === 'backupvolumes') dispatch({ type: `${ns}/updateSocketStatusBackupVolumes`, payload: 'open' })
      if (backupType === 'backups') dispatch({ type: `${ns}/updateSocketStatusBackups`, payload: 'open' })
    } else if (ns === 'systemBackups') {
      if (backupType === 'systembackups') dispatch({ type: `${ns}/updateSocketStatusSysteBackups`, payload: 'open' })
      if (backupType === 'systemrestores') dispatch({ type: `${ns}/updateSocketStatusSystemRestores`, payload: 'open' })
    } else {
      dispatch({ type: `${ns}/updateSocketStatus`, payload: 'open' })
    }
  })
  rws.addEventListener('close', () => {
    if (ns === 'backup') {
      if (backupType === 'backupvolumes') dispatch({ type: `${ns}/updateSocketStatusBackupVolumes`, payload: 'closed' })
      if (backupType === 'backups') dispatch({ type: `${ns}/updateSocketStatusBackups`, payload: 'closed' })
    } else if (ns === 'systemBackups') {
      if (backupType === 'systembackups') dispatch({ type: `${ns}/updateSocketStatusSysteBackups`, payload: 'closed' })
      if (backupType === 'systemrestores') dispatch({ type: `${ns}/updateSocketStatusSystemRestores`, payload: 'closed' })
    } else {
      dispatch({ type: `${ns}/updateSocketStatus`, payload: 'closed' })
    }
  })
  rws.addEventListener('error', () => {
    if (expectError) {
      expectError = false
    } else {
      if (ns === 'backup') {
        if (backupType === 'backupvolumes') dispatch({ type: `${ns}/updateSocketStatusBackupVolumes`, payload: 'error' })
        if (backupType === 'backups') dispatch({ type: `${ns}/updateSocketStatusBackups`, payload: 'error' })
      } else {
        dispatch({ type: `${ns}/updateSocketStatus`, payload: 'error' })
      }
    }
  })
}

export function getStatusIcon(resource) {
  if (resource === undefined) {
    return
  }
  const type = resource.resourceType
  const status = resource.socketStatus

  const title = `${type}: ${status}`

  let src

  switch (status) {
    case 'connecting':
      src = wsConnecting
      break
    case 'open':
      src = wsOpen
      break
    case 'closed':
      src = wsClosed
      break
    case 'error':
    default:
      src = wsError
  }
  return (
    <Tooltip placement="topRight" title={title}>
      <img src={src} alt="WS"></img>
    </Tooltip>
  )
}

// Backup model has two websocket status.
export function getBackupStatusIcon (resource, type) {
  if (resource === undefined) {
    return
  }
  const status = type === 'backupVolumes' ? resource.socketStatusBackupVolumes : resource.socketStatusBackups

  const title = type === 'backupVolumes' ? `BackupVolumes: ${status}` : `Backups: ${status}`

  let src

  switch (status) {
    case 'connecting':
      src = wsConnecting
      break
    case 'open':
      src = wsOpen
      break
    case 'closed':
      src = wsClosed
      break
    case 'error':
    default:
      src = wsError
  }
  return (
    <Tooltip placement="topRight" title={title}>
      <img src={src} alt="WS"></img>
    </Tooltip>
  )
}

// System Backup model has two websocket status.
export function getSystemBackupStatusIcon (resource, type) {
  if (resource === undefined) {
    return
  }
  const status = type === 'systemBackup' ? resource.socketSystemBackupsStatus : resource.socketSystemRestoresStatus

  const title = type === 'systemBackup' ? `System Backup: ${status}` : `System Restore: ${status}`

  let src

  switch (status) {
    case 'connecting':
      src = wsConnecting
      break
    case 'open':
      src = wsOpen
      break
    case 'closed':
      src = wsClosed
      break
    case 'error':
    default:
      src = wsError
  }
  return (
    <Tooltip placement="topRight" title={title}>
      <img src={src} alt="WS"></img>
    </Tooltip>
  )
}

export function updateState(state, action) {
  const data = action.payload && action.payload.data ? action.payload.data : []
  // When resourceType is undefined, it means that the data is not updated.
  if (action.payload && action.payload.resourceType) {
    return {
      ...state,
      data,
    }
  }
  return state
}

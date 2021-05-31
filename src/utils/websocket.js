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

export function wsChanges(dispatch, type, period, ns) {
  let url = constructWebsocketURL(type, period)
  const options = {
    timeout: 4000,
    shouldReconnect: function(event, ws) {
      if (event.code === 1008 || event.code === 1011) return
      return [0, 3000, 10000][ws.attempts]
    },
    automaticOpen: true,
  }
  const rws = new RobustWebSocket(url, [], options)
  dispatch({ type: `${ns}/updateSocketStatus`, payload: 'connecting' })
  dispatch({ type: `${ns}/updateWs`, payload: rws })
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
    dispatch({
      type: `${ns}/updateBackground`,
      payload: JSON.parse(msg.data),
    })
  })
  rws.addEventListener('open', () => {
    dispatch({ type: `${ns}/updateSocketStatus`, payload: 'open' })
  })
  rws.addEventListener('close', () => {
    dispatch({ type: `${ns}/updateSocketStatus`, payload: 'closed' })
  })
  rws.addEventListener('error', () => {
    if (expectError) {
      expectError = false
    } else {
      dispatch({ type: `${ns}/updateSocketStatus`, payload: 'error' })
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

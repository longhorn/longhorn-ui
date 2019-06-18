import React from 'react'
import { Tooltip } from 'antd'
import ReconnectingWebSocket from 'reconnecting-websocket'
import wsClosed from '../assets/images/ws-closed.svg'
import wsConnecting from '../assets/images/ws-connecting.svg'
import wsError from '../assets/images/ws-error.svg'
import wsOpen from '../assets/images/ws-open.svg'
import { getPrefix } from './pathnamePrefix'

export function constructWebsocketURL(type, period) {
  let loc = window.location

  let proto = 'ws:'
  if (loc.protocol === 'https:') {
    proto = 'wss:'
  }

  let prefix = getPrefix()
  if (prefix === '') {
    prefix = '/'
  }

  return `${proto}//${loc.host}${prefix}v1/ws/${period}/${type}`
}

export function wsChanges(dispatch, type, period) {
  let url = constructWebsocketURL(type, period)
  const options = {}
  const rws = new ReconnectingWebSocket(url, [], options)
  dispatch({ type: 'updateSocketStatus', payload: 'connecting' })
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
      type: 'updateBackground',
      payload: JSON.parse(msg.data),
    })
  })
  rws.addEventListener('open', () => {
    dispatch({ type: 'updateSocketStatus', payload: 'open' })
  })
  rws.addEventListener('close', () => {
    dispatch({ type: 'updateSocketStatus', payload: 'closed' })
  })
  rws.addEventListener('error', () => {
    if (expectError) {
      expectError = false
    } else {
      dispatch({ type: 'updateSocketStatus', payload: 'error' })
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
  var src
  switch(status) {
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

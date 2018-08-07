import { Tooltip } from 'antd'
import wsClosed from '../assets/images/ws-closed.svg'
import wsError from '../assets/images/ws-error.svg'
import wsOpen from '../assets/images/ws-open.svg'

export function constructWebsocketURL(type, period) {
  let loc = window.location

  let proto = 'ws:'
  if (loc.protocol === 'https:') {
    proto = 'wss:'
  }

  let host = loc.host

  return `${proto}//${host}/v1/ws/${period}/${type}`
}

export function wsChanges(dispatch, type, period) {
  let url = constructWebsocketURL(type, period)
  const ws = new WebSocket(url)
  ws.onmessage = function (msg) {
    dispatch({
      type: 'updateBackground',
      payload: JSON.parse(msg.data),
    })
  }
  ws.onopen = function () {
    dispatch({ type: 'updateSocketStatus', payload: 'open' })
  }
  ws.onclose = function () {
    dispatch({ type: 'updateSocketStatus', payload: 'closed' })
  }
  ws.onerror = function () {
    dispatch({ type: 'updateSocketStatus', payload: 'error' })
  }
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
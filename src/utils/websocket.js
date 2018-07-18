function constructWebsocketURL(type, period) {
  let loc = window.location

  let proto = 'ws:'
  if (loc.protocol === 'https:') {
    proto = 'wss:'
  }

  // FIXME this should be derived from LONGHORN_MANAGER_IP
  let host = '127.0.0.1:9500'
  // the local dev server doesn't forward websockets correctly so we bypass it
  if (loc.host !== 'localhost:8000') {
    host = loc.host
  }

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
}

import ReconnectingWebSocket from 'reconnecting-websocket'

function constructWebsocketURL(type, period) {
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
  const options = {
    connectionTimeout: 10000,
    maxRetries: 10,
  }
  const rws = new ReconnectingWebSocket(url, [], options)
  rws.addEventListener('message', (msg) => {
    dispatch({
      type: 'updateBackground',
      payload: JSON.parse(msg.data),
    })
  })
}

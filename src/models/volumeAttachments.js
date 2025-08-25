import { getVolumeAttachments, getVolumeAttachmentById } from '../services/volume'
import { wsChanges } from '../utils/websocket'
import { enableQueryData } from '../utils/dataDependency'

export default {
  namespace: 'volumeAttachments',
  state: {
    ws: null,
    data: {},
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (!enableQueryData(location.pathname, 'volume')) return

        const path = location.pathname
        if (path === '/volume') {
          dispatch({ type: 'query' })
        } else if (path.startsWith('/volume/')) {
          const id = path.split('/')[2]
          if (id) {
            dispatch({ type: 'queryById', payload: { id } })
          }
        }
      })
    },
  },
  effects: {
    *query({ payload }, { call, put }) {
      const list = yield call(getVolumeAttachments, payload)
      const dataById = list.data.reduce((acc, item) => {
        acc[item.id] = item
        return acc
      }, {})
      yield put({ type: 'update', payload: { data: dataById } })
    },
    *queryById({ payload }, { call, put, select }) {
      const volumeAttachments = yield select(state => state.volumeAttachments)
      if (volumeAttachments.data[payload.id]) return

      const data = yield call(getVolumeAttachmentById, payload.id)
      if (data) {
        yield put({
          type: 'update',
          payload: { data: { ...volumeAttachments.data, [payload.id]: data } },
        })
      }
    },
    *startWS({ payload }, { select }) {
      let ws = yield select(state => state.volumeAttachments.ws)
      if (ws) {
        ws.open()
      } else {
        wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
      }
    },
    *stopWS(_, { select }) {
      let ws = yield select(state => state.volumeAttachments.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    update(state, action) {
      return { ...state, data: action.payload.data || {} }
    },

    updateBackground(state, action) {
      const incoming = action.payload
      const existing = state.data || {}
      const newData = { ...existing }

      if (Array.isArray(incoming.data)) {
        incoming.data.forEach(item => {
          newData[item.id] = item
        })
      }

      return { ...state, data: newData }
    },

    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },

    updateWs(state, action) {
      return { ...state, ws: action.payload }
    },
  },
}

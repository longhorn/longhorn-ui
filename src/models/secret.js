import { listSecrets } from '../services/secret'
import { wsChanges } from '../utils/websocket'
import queryString from 'query-string'
import { enableQueryData } from '../utils/dataDependency'

export default {
  namespace: 'secret',
  state: {
    ws: null,
    data: [],
    selected: {},
    resourceType: 'secretRef',
    socketStatus: 'closed',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (enableQueryData(location.pathname, 'secret')) {
          dispatch({
            type: 'query',
            payload: location.pathname.startsWith('/secret') ? queryString.parse(location.search) : {},
          })
        }
      })
    },
  },
  effects: {
    *query({ payload }, { call, put }) {
      const data = yield call(listSecrets, payload)
      console.log(data)
      yield put({ type: 'listSecrets', payload: { ...data } })
    },
    *startWS({ payload }, { select }) {
      let ws = yield select(state => state.secret.ws)
      if (ws) {
        ws.open()
      } else {
        wsChanges(payload.dispatch, payload.type, '1s', payload.ns)
      }
    },
    // eslint-disable-next-line no-unused-vars
    *stopWS({ payload }, { select }) {
      let ws = yield select(state => state.secret.ws)
      if (ws) {
        ws.close(1000)
      }
    },
  },
  reducers: {
    listSecrets(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}

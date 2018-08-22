import { query } from '../services/eventlog'
import { wsChanges } from '../utils/websocket'
import { parse } from 'qs'
import { getSorter, saveSorter } from '../utils/store'

export default {
  namespace: 'eventlog',
  state: {
    data: [],
    socketStatus: 'closed',
    sorter: getSorter('eventlogList.sorter'),
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'query',
          payload: location.query,
        })
      })
      wsChanges(dispatch, 'events', '1s')
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      yield put({ type: 'queryEventlog', payload: { ...data } })
    },
    *updateBackground({ payload }, { put }) {
      const data = payload
      yield put({ type: 'queryEventlog', payload: { ...data } })
    },
  },
  reducers: {
    queryEventlog(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    updateSocketStatus(state, action) {
      return { ...state, socketStatus: action.payload }
    },
    updateSorter(state, action) {
      saveSorter('eventlogList.sorter', action.payload)
      return { ...state, sorter: action.payload }
    },
  },
}

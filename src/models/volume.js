import { query } from '../services/volume'
import { parse } from 'qs'

export default {
  namespace: 'volume',
  state: {
    data: [],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'query' })
    },
  },
  effects: {
    *query({
      payload,
    }, { call, put }) {
      const data = yield call(query, parse(payload))
      yield put({ type: 'queryVolume', payload: { ...data } })
    },
  },
  reducers: {
    queryVolume(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}

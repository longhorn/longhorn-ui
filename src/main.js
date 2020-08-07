import createHistory from 'history/createHashHistory'
import createLoading from 'dva-loading'
import dva from 'dva'

// 1. Initialize
const app = dva({
  ...createLoading(),
  history: createHistory({
    queryKey: false,
  }),
  onError() {
  },
})

export default app

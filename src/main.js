import createHistory from 'history/createBrowserHistory'
import createLoading from 'dva-loading'
import dva from 'dva'

// 1. Initialize
const app = dva({
  ...createLoading(),
  history: createHistory(),
  onError() {
  },
})

export default app

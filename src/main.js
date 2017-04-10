import { browserHistory } from 'dva/router'
import createLoading from 'dva-loading'
import dva from 'dva'

// 1. Initialize
const app = dva({
  ...createLoading(),
  history: browserHistory,
  onError(error) {
    console.error('app onError -- ', error)
  },
})

export default app

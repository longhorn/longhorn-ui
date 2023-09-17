import { createHashHistory } from 'history'
import createLoading from 'dva-loading'
import dva from 'dva'

// 1. Initialize
const app = dva({
  ...createLoading(),
  history: createHashHistory({
    queryKey: false,
  }),
  onError() {
  },
})

export default app

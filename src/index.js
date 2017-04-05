import createLoading from 'dva-loading'
import dva from 'dva'
import { browserHistory } from 'dva/router'
import './index.html'

// 1. Initialize
const app = dva({
  ...createLoading(),
  history: browserHistory,
  onError(error) {
    console.error('app onError -- ', error)
  },
})

// 2. Model
app.model(require('./models/app'))

// 3. Router
app.router(require('./router'))

// 4. Start
app.start('#root')

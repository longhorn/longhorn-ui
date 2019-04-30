import './publicPath'

// import assets
import './assets/iconfont/iconfont.eot'
import './assets/iconfont/iconfont.svg'
import './assets/iconfont/iconfont.ttf'
import './assets/iconfont/iconfont.woff'

// import global styles
import './assets/styles/index.less'

import app from './main'

import routerConfig from './router'

// 2. Model
app.model(require('./models/app').default)
app.model(require('./models/snapshot').default('snapshotModal'))

// 3. Router
app.router(routerConfig)

// 4. Start
app.start('#root')

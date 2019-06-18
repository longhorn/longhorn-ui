import './publicPath'
import appmodel from './models/app'
import host from './models/host'
import volume from './models/volume'
import setting from './models/setting'
import eventlog from './models/eventlog'
import engineimage from './models/engineimage'
import backup from './models/backup'
import snapshot from './models/snapshot'

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
app.model(appmodel)
app.model(snapshot('snapshotModal'))
app.model(host)
app.model(setting)
app.model(eventlog)
app.model(engineimage)
app.model(backup)
app.model(volume)

// 3. Router
app.router(routerConfig)

// 4. Start
app.start('#root')

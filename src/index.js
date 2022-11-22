import './publicPath'
import appmodel from './models/app'
import host from './models/host'
import volume from './models/volume'
import setting from './models/setting'
import eventlog from './models/eventlog'
import engineimage from './models/engineimage'
import backingImage from './models/backingImage'
import backup from './models/backup'
import snapshot from './models/snapshot'
import recurringJob from './models/recurringJob'
import instanceManager from './models/instanceManager'
import orphanedData from './models/orphanedData'
import systemBackups from './models/systemBackups'

// import assets
import './assets/iconfont/iconfont.eot'
import './assets/iconfont/iconfont.svg'
import './assets/iconfont/iconfont.ttf'
import './assets/iconfont/iconfont.woff'

// import global styles
import './assets/styles/index.less'

import app from './main'

import routerConfig from './router'

// 2. Model (I am also helpless to not be able to load on demand, that the data is closely related, it must be loaded all!)
app.model(appmodel)
app.model(snapshot('snapshotModal'))
app.model(host)
app.model(setting)
app.model(eventlog)
app.model(engineimage)
app.model(backingImage)
app.model(backup)
app.model(volume)
app.model(recurringJob)
app.model(instanceManager)
app.model(orphanedData)
app.model(systemBackups)

// 3. Router
app.router(routerConfig)

// 4. Start
app.start('#root')

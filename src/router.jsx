import React from 'react'
import PropTypes from 'prop-types'
import { Router, Switch, Route } from 'dva/router'
import dynamic from 'dva/dynamic'
import notfound from './routes/notfound/'
import appComponent from './routes/app.js'
import dashboardComponent from './routes/dashboard/'
import volumeComponent from './routes/volume/'
import nodeComponent from './routes/host/'
import volumeDetailComponent from './routes/volume/detail'
import backupComponent from './routes/backup/'
import backupDetailComponent from './routes/backup/BackupDetail'
import settingComponent from './routes/setting/'
import engineimageComponent from './routes/engineimage/'
import engineimageDetailComponent from './routes/engineimage/detail'

const Routers = function ({ history, app }) {
  const App = dynamic({
    app,
    models: () => [
      import('./models/host.js'),
      import('./models/volume.js'),
      import('./models/setting.js'),
      import('./models/eventlog.js'),
      import('./models/engineimage.js'),
      import('./models/backup.js'),
    ],
    component: () => appComponent,
  })

  const dashboard = dynamic({
    app,
    models: () => [
      import('./models/host.js'),
      import('./models/volume.js'),
      import('./models/setting.js'),
      import('./models/eventlog.js'),
    ],
    component: () => dashboardComponent,
  })

  const node = dynamic({
    app,
    models: [
      import('./models/host.js'),
      import('./models/volume.js'),
      import('./models/setting.js'),
    ],
    component: () => nodeComponent,
  })

  const volume = dynamic({
    app,
    models: [
      import('./models/host.js'),
      import('./models/engineimage.js'),
      import('./models/volume.js'),
      import('./models/setting.js'),
    ],
    component: () => volumeComponent,
  })

  const volumeDetail = dynamic({
    app,
    models: [
      import('./models/host.js'),
      import('./models/engineimage.js'),
      import('./models/volume.js'),
      import('./models/setting.js'),
      import('./models/backup.js'),
    ],
    component: () => volumeDetailComponent,
  })

  const backup = dynamic({
    app,
    models: [
      import('./models/host.js'),
      import('./models/backup.js'),
      import('./models/setting.js'),
    ],
    component: () => backupComponent,
  })

  const backupDetail = dynamic({
    app,
    models: [
      import('./models/host.js'),
      import('./models/backup.js'),
      import('./models/setting.js'),
    ],
    component: () => backupDetailComponent,
  })

  const setting = dynamic({
    app,
    models: [
      import('./models/setting.js'),
    ],
    component: () => settingComponent,
  })

  const engineimage = dynamic({
    app,
    models: [
      import('./models/setting.js'),
      import('./models/engineimage.js'),
    ],
    component: () => engineimageComponent,
  })

  const engineimageDetail = dynamic({
    app,
    models: [
      import('./models/setting.js'),
      import('./models/engineimage.js'),
    ],
    component: () => engineimageDetailComponent,
  })

  return (
    <Router history={history}>
      <Switch>
        <App path="/" component={App} >
         <Switch>
          <Route path="/dashboard" component={dashboard} />
          <Route exact path="/node" component={node} />
          <Route exact path="/volume" component={volume} />
          <Route exact path="/volume/:id" component={volumeDetail} />
          <Route exact path="/backup" component={backup} />
          <Route exact path="/backup/:id" component={backupDetail} />
          <Route exact path="/setting" component={setting} />
          <Route exact path="/engineimage" component={engineimage} />
          <Route exact path="/engineimage/:id" component={engineimageDetail} />
          <Route component={notfound} />
         </Switch>
        </App>
      </Switch>
    </Router>
  )
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers

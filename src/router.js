import React from 'react'
import PropTypes from 'prop-types'
import { Router, Switch, Route, Redirect } from 'dva/router'
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
import instanceManagerComponent from './routes/instanceManager/'
import backingImageComponent from './routes/backingImage/'
import recurringJobComponent from './routes/recurringJob/'
import orphanedDataComponent from './routes/orphanedData/'
import engineimageDetailComponent from './routes/engineimage/detail'
import systemBackupsComponent from './routes/systemBackups/'

const Routers = function ({ history, app }) {
  const App = dynamic({
    app,
    component: () => appComponent,
  })

  const dashboard = dynamic({
    app,
    component: () => dashboardComponent,
  })

  const node = dynamic({
    app,
    component: () => nodeComponent,
  })

  const volume = dynamic({
    app,
    component: () => volumeComponent,
  })

  const volumeDetail = dynamic({
    app,
    component: () => volumeDetailComponent,
  })

  const backup = dynamic({
    app,
    component: () => backupComponent,
  })

  const backupDetail = dynamic({
    app,
    component: () => backupDetailComponent,
  })

  const setting = dynamic({
    app,
    component: () => settingComponent,
  })

  const engineimage = dynamic({
    app,
    component: () => engineimageComponent,
  })

  const backingImage = dynamic({
    app,
    component: () => backingImageComponent,
  })

  const recurringJob = dynamic({
    app,
    component: () => recurringJobComponent,
  })

  const engineimageDetail = dynamic({
    app,
    component: () => engineimageDetailComponent,
  })

  const instanceManager = dynamic({
    app,
    component: () => instanceManagerComponent,
  })

  const orphanedData = dynamic({
    app,
    component: () => orphanedDataComponent,
  })

  const systemBackups = dynamic({
    app,
    component: () => systemBackupsComponent,
  })

  const path = '/'

  return (
    <Router history={history}>
      <Switch>
        <App path={path} component={App}>
          <Switch>
            <Route exact path={path} render={() => <Redirect to={`${path}dashboard`} />} />
            <Route path={`${path}dashboard`} component={dashboard} />
            <Route path={`${path}node`} component={node} />
            <Route exact path={`${path}volume`} component={volume} />
            <Route path={`${path}volume/:id`} component={volumeDetail} />
            <Route exact path={`${path}backup`} component={backup} />
            <Route path={`${path}backup/:id`} component={backupDetail} />
            <Route path={`${path}setting`} component={setting} />
            <Route exact path={`${path}engineimage`} component={engineimage} />
            <Route exact path={`${path}instanceManager`} component={instanceManager} />
            <Route exact path={`${path}backingImage`} component={backingImage} />
            <Route exact path={`${path}recurringJob`} component={recurringJob} />
            <Route path={`${path}engineimage/:id`} component={engineimageDetail} />
            <Route path={`${path}orphanedData`} component={orphanedData} />
            <Route path={`${path}systemBackups`} component={systemBackups} />
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

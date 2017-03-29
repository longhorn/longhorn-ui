import React, { PropTypes } from 'react'
import { Router } from 'dva/router'
import App from './routes/app'

const cached = {}
const registerModel = (app, model) => {
  if (!cached[model.namespace]) {
    app.model(model)
    cached[model.namespace] = 1
  }
}

const Routers = function ({ history, app }) {
  const routes = [
    {
      path: '/',
      component: App,
      getIndexRoute(nextState, cb) {
        require.ensure([], require => {
          registerModel(app, require('./models/dashboard'))
          cb(null, { component: require('./routes/dashboard/') })
        }, 'dashboard')
      },
      childRoutes: [
        {
          path: 'dashboard',
          name: 'dashboard',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/dashboard'))
              cb(null, require('./routes/dashboard/'))
            }, 'dashboard')
          },
        },
        {
          path: 'host',
          name: 'host',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/host'))
              cb(null, require('./routes/host/'))
            }, 'host')
          },
        },
        {
          path: 'volume',
          name: 'volume',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/volume'))
              cb(null, require('./routes/volume/'))
            }, 'volume')
          },
        },
        {
          path: 'backups',
          name: 'backups',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/backup'))
              cb(null, require('./routes/backup/'))
            }, 'backup')
          },
        },
        {
          path: 'setting',
          name: 'setting',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              registerModel(app, require('./models/setting'))
              cb(null, require('./routes/setting/'))
            }, 'setting')
          },
        },
        {
          path: '*',
          name: 'error',
          getComponent(nextState, cb) {
            require.ensure([], require => {
              cb(null, require('./routes/error/'))
            }, 'error')
          },
        },
      ],
    },
  ]

  return <Router history={history} routes={routes} />
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers

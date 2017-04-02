import React, { PropTypes } from 'react'
import { Router } from 'dva/router'
import App from './routes/app'
import nprogress from 'nprogress'

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
        nprogress.start()
        require.ensure([], require => {
          nprogress.done()
          registerModel(app, require('./models/dashboard'))
          cb(null, { component: require('./routes/dashboard/') })
        }, 'dashboard')
      },
      childRoutes: [
        {
          path: 'dashboard',
          name: 'dashboard',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/dashboard'))
              cb(null, require('./routes/dashboard/'))
            }, 'dashboard')
          },
        },
        {
          path: 'host',
          name: 'host',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/host'))
              cb(null, require('./routes/host/'))
            }, 'host')
          },
        },
        {
          path: 'volume',
          name: 'volume',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/host'))
              registerModel(app, require('./models/volume'))
              cb(null, require('./routes/volume/'))
            }, 'volume')
          },
        },
        {
          path: 'volume/:id',
          name: 'volume/detail',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/volume'))
              cb(null, require('./routes/volume/detail'))
            }, 'volume-detail')
          },
        },
        {
          path: 'backups',
          name: 'backups',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/backup'))
              cb(null, require('./routes/backup/'))
            }, 'backup')
          },
        },
        {
          path: 'setting',
          name: 'setting',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/setting'))
              cb(null, require('./routes/setting/'))
            }, 'setting')
          },
        },
        {
          path: 'snapshot',
          name: 'snapshot',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
              registerModel(app, require('./models/snapshot'))
              cb(null, require('./routes/snapshot'))
            }, 'snapshot')
          },
        },
        {
          path: '*',
          name: 'error',
          getComponent(nextState, cb) {
            nprogress.start()
            require.ensure([], require => {
              nprogress.done()
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

// key is the payload type, see model/app.js subscriptions()
const dependency = {
  dashboard: {
    path: '/dashboard',
    runWs: [{
      ns: 'volume',
      key: 'volumes',
    }, {
      ns: 'host',
      key: 'nodes',
    }, {
      ns: 'eventlog',
      key: 'events',
    }],
  },
  host: {
    path: '/node',
    runWs: [{
      ns: 'volume',
      key: 'volumes',
    }, {
      ns: 'host',
      key: 'nodes',
    }, {
      ns: 'setting',
      key: 'settings',
    }],
  },
  volume: {
    path: '/volume',
    runWs: [{
      ns: 'volume',
      key: 'volumes',
    }, {
      ns: 'host',
      key: 'nodes',
    }, {
      ns: 'setting',
      key: 'settings',
    }, {
      ns: 'backingImage',
      key: 'backingimages',
    }, {
      ns: 'engineimage',
      key: 'engineimages',
    }, {
      ns: 'recurringJob',
      key: 'recurringjobs',
    }],
  },
  engineimage: {
    path: '/engineimage',
    runWs: [{
      ns: 'engineimage',
      key: 'engineimages',
    }],
  },
  recurringJob: {
    path: '/recurringJob',
    runWs: [{
      ns: 'recurringJob',
      key: 'recurringjobs',
    }],
  },
  backingImage: {
    path: '/backingImage',
    runWs: [{
      ns: 'volume',
      key: 'volumes',
    }, {
      ns: 'backingImage',
      key: 'backingimages',
    }, {
      ns: 'backingImage',
      key: 'backupbackingimages',
    }, {
      ns: 'setting',
      key: 'settings',
    }],
  },
  settings: {
    path: '/setting',
    runWs: [{
      ns: 'setting',
      key: 'settings',
    }],
  },
  backup: {
    path: '/backup',
    runWs: [{
      ns: 'host',
      key: 'nodes',
    }, {
      ns: 'setting',
      key: 'settings',
    }, {
      ns: 'backingImage',
      key: 'backingimages',
    }, {
      ns: 'backup',
      key: 'backupvolumes',
    }, {
      ns: 'backup',
      key: 'backups',
    }],
  },
  instanceManager: {
    path: '/instanceManager',
    runWs: [{
      ns: 'volume',
      key: 'volumes',
    }],
  },
  orphanedData: {
    path: '/orphanedData',
    runWs: [],
  },
  systemBackups: {
    path: '/systemBackups',
    runWs: [{
      ns: 'systemBackups',
      key: 'systemBackups',
    }],
  },
}
const list = [{
  ns: 'volume',
  key: 'volumes',
}, {
  ns: 'host',
  key: 'nodes',
}, {
  ns: 'setting',
  key: 'settings',
}, {
  ns: 'eventlog',
  key: 'events',
}, {
  ns: 'backingImage',
  key: 'backingimages',
}, {
  ns: 'backingImage',
  key: 'backupbackingimages',
}, {
  ns: 'engineimage',
  key: 'engineimages',
}, {
  ns: 'recurringJob',
  key: 'recurringjobs',
}, {
  ns: 'backup',
  key: 'backupvolumes',
}, {
  ns: 'backup',
  key: 'backups',
}, {
  ns: 'systemBackups',
  key: 'systembackups',
}, {
  ns: 'systemBackups',
  key: 'systemrestores',
}]

const httpDataDependency = {
  '/dashboard': ['volume', 'host', 'eventlog'],
  '/node': ['volume', 'host', 'setting'],
  '/volume': ['volume', 'host', 'setting', 'backingImage', 'engineimage', 'recurringJob', 'backup'],
  '/engineimage': ['engineimage'],
  '/recurringJob': ['recurringJob'],
  '/backingImage': ['volume', 'backingImage', 'setting', 'backup'],
  '/setting': ['setting'],
  '/backup': ['host', 'setting', 'backingImage', 'backup'],
  '/instanceManager': ['volume', 'instanceManager'],
  '/orphanedData': ['orphanedData'],
  '/systemBackups': ['systemBackups', 'backup'],
}

export function getDataDependency(pathName) {
  let keys = Object.keys(dependency).filter((key) => {
    if (pathName && dependency[key].path) {
      let max = dependency[key].path.length
      return dependency[key].path === pathName.substring(0, max)
    }
    return false
  })

  if (keys && keys.length === 1) {
    let modal = dependency[keys[0]]
    modal.stopWs = list.filter((item) => {
      return modal.runWs.every((ele) => ele.ns !== item.ns)
    })
    return dependency[keys[0]]
  }
  return null
}

export function enableQueryData(pathName, ns) {
  let canQueryData = false

  // Determining whether other dependencies model need to request data
  if (Object.keys(httpDataDependency).some((key) => pathName.startsWith(key) && httpDataDependency[key].find((item) => item === ns))) {
    canQueryData = true
  }

  return canQueryData
}

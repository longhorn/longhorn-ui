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
    }],
  },
  engineimage: {
    path: '/engineimage',
    runWs: [{
      ns: 'engineimage',
      key: 'engineimages',
    }],
  },
  backingImage: {
    path: '/backingImage',
    runWs: [{
      ns: 'backingImage',
      key: 'backingimages',
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
    }],
  },
}
const allWs = [{
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
  ns: 'engineimage',
  key: 'engineimages',
}]

const httpDataDependency = {
  '/dashboard': ['volume', 'host', 'eventlog'],
  '/node': ['volume', 'host', 'setting'],
  '/volume': ['volume', 'host', 'setting', 'backingImage', 'engineimage', 'recurringJob'],
  '/engineimage': ['engineimage'],
  '/recurringJob': ['recurringJob'],
  '/backingImage': ['volume', 'backingImage'],
  '/setting': ['setting'],
  '/backup': ['host', 'setting', 'backingImage', 'backup'],
  '/instanceManager': ['volume', 'instanceManager'],
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
    modal.stopWs = allWs.filter((item) => {
      return modal.runWs.every((ele) => {
        return ele.ns !== item.ns
      })
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

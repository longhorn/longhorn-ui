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

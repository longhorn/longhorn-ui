import { getClusterState } from './favicon'
import { faultedVolume, degradedVolume, inProgressVolume, detachedVolume } from './filter'

const healthyVolume = { state: 'attached', robustness: 'healthy' }
const degradedVol = { state: 'attached', robustness: 'degraded' }
const inProgressVol = { state: 'attached', robustness: 'creating' }
const faultedVol = { state: 'detached', robustness: 'faulted' }
const detachedVol = { state: 'detached', robustness: 'healthy' }

const healthyHost = {
  allowScheduling: true,
  conditions: {
    Ready: { status: 'True' },
    Schedulable: { status: 'True' },
  },
  disks: {
    'disk-1': {
      allowScheduling: true,
      conditions: {
        Ready: { status: 'True' },
        Schedulable: { status: 'True' },
      },
    },
  },
}

const clone = (obj) => JSON.parse(JSON.stringify(obj))

const downHost = () => {
  const host = clone(healthyHost)
  host.conditions.Ready.status = 'False'
  return host
}

const unschedulableHost = () => {
  const host = clone(healthyHost)
  host.conditions.Schedulable.status = 'False'
  return host
}

const autoEvictingHost = () => {
  const host = unschedulableHost()
  host.autoEvicting = true
  return host
}

const hosts = (list) => ({ data: list })
const volumes = (list) => ({ data: list })

describe('getClusterState', () => {
  it('returns healthy when all volumes and nodes are fine', () => {
    const state = getClusterState(hosts([clone(healthyHost)]), volumes([clone(healthyVolume)]))
    expect(state).toEqual({ color: '#27AE5F', state: 'healthy' })
  })

  it('returns healthy when there is no data', () => {
    expect(getClusterState(hosts([]), volumes([]))).toEqual({ color: '#27AE5F', state: 'healthy' })
    expect(getClusterState(null, null)).toEqual({ color: '#27AE5F', state: 'healthy' })
  })

  it('returns warning when a volume is degraded', () => {
    const state = getClusterState(hosts([clone(healthyHost)]), volumes([clone(degradedVol)]))
    expect(state).toEqual({ color: '#F1C40F', state: 'warning' })
  })

  it('returns warning when a volume is in progress', () => {
    const state = getClusterState(hosts([clone(healthyHost)]), volumes([clone(inProgressVol)]))
    expect(state).toEqual({ color: '#F1C40F', state: 'warning' })
  })

  it('returns warning when a node is unschedulable or auto-evicting', () => {
    expect(getClusterState(hosts([clone(healthyHost), unschedulableHost()]), volumes([clone(healthyVolume)])))
      .toEqual({ color: '#F1C40F', state: 'warning' })
    expect(getClusterState(hosts([clone(healthyHost), autoEvictingHost()]), volumes([clone(healthyVolume)])))
      .toEqual({ color: '#F1C40F', state: 'warning' })
  })

  it('returns error when a volume is faulted', () => {
    const state = getClusterState(hosts([clone(healthyHost)]), volumes([clone(faultedVol)]))
    expect(state).toEqual({ color: '#F15354', state: 'error' })
  })

  it('returns error when a node is down', () => {
    const state = getClusterState(hosts([clone(healthyHost), downHost()]), volumes([clone(healthyVolume)]))
    expect(state).toEqual({ color: '#F15354', state: 'error' })
  })

  it('returns error when both a faulted volume and a down node exist', () => {
    const state = getClusterState(hosts([downHost()]), volumes([clone(faultedVol), clone(degradedVol)]))
    expect(state).toEqual({ color: '#F15354', state: 'error' })
  })

  it('ignores detached volumes', () => {
    const vols = [clone(detachedVol), { state: 'detached', robustness: 'degraded' }]
    expect(detachedVolume(vols)).toHaveLength(2)
    expect(faultedVolume(vols)).toHaveLength(0)
    expect(degradedVolume(vols)).toHaveLength(0)
    expect(inProgressVolume(vols)).toHaveLength(0)
    expect(getClusterState(hosts([clone(healthyHost)]), volumes(vols)))
      .toEqual({ color: '#27AE5F', state: 'healthy' })
  })
})
import { canCreatePV } from '../pv'

describe('canCreatePV', () => {
  const noPV = { kubernetesStatus: { pvName: '' } }

  it('needs a file system type, except for a shared block volume', () => {
    expect(canCreatePV(noPV, { pvName: 'pv', fsType: 'ext4' })).toBe(true)
    expect(canCreatePV(noPV, { pvName: 'pv' })).toBe(false)
    expect(canCreatePV({ ...noPV, sharedBlock: true }, { pvName: 'pv' })).toBe(true)
  })

  it('needs a name and a volume without a PV', () => {
    expect(canCreatePV({ ...noPV, sharedBlock: true }, {})).toBe(false)
    expect(canCreatePV({ kubernetesStatus: { pvName: 'pv' }, sharedBlock: true }, { pvName: 'pv' })).toBe(false)
    expect(canCreatePV(undefined, undefined)).toBe(false)
  })
})

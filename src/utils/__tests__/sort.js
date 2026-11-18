import { getPropValue, sortVolume } from '../sort'

describe('sort', () => {
  it('getPropValue should be ok', () => {
    const val = getPropValue({ a: 1 }, 'a')
    expect(val).toBe(1)
  })

  it('sortVolume should order by created time regardless of zone abbreviation', () => {
    const volumes = [
      { name: 'older', state: 'healthy', created: '2024-12-06 19:07:17 +0000 WET' },
      { name: 'newer', state: 'healthy', created: '2025-07-01 13:00:00 +0100 WEST' },
    ]
    sortVolume(volumes)
    expect(volumes.map(v => v.name)).toEqual(['newer', 'older'])
  })
})

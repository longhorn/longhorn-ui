import { getPropValue } from '../sort'

describe('sort', () => {
  it('getPropValue should be ok', () => {
    const val = getPropValue({ a: 1 }, 'a')
    expect(val).toBe(1)
  })
})

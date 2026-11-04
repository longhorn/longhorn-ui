import cronValidate from '../cronValidate'

describe('cronValidate', () => {
  it('accepts Sunday as day of week 0', () => {
    expect(cronValidate('0 0 * * 0')).toBe(true)
    expect(cronValidate('0 0 * * 0,6')).toBe(true)
    expect(cronValidate('0 0 * * 0-4')).toBe(true)
    expect(cronValidate('0 0 * * 0-6')).toBe(true)
  })

  it('accepts day of week names', () => {
    expect(cronValidate('0 0 * * SUN,SAT')).toBe(true)
    expect(cronValidate('0 0 * * MON-FRI')).toBe(true)
    expect(cronValidate('0 0 * * SUN-SAT')).toBe(true)
  })

  it('rejects day of week values outside 0-6', () => {
    expect(cronValidate('0 0 * * 1-7')).toBe(false)
    expect(cronValidate('0 0 * * 5,7')).toBe(false)
  })
})

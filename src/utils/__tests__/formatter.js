import { utcStrToDate } from '../formatter'

describe('utcStrToDate', () => {
  const expected = new Date(Date.UTC(2024, 11, 6, 19, 7, 17))

  it('should parse a UTC timestamp', () => {
    expect(utcStrToDate('2024-12-06 19:07:17 +0000 UTC')).toEqual(expected)
  })

  it('should parse a zero-offset timestamp with a non-UTC zone abbreviation', () => {
    expect(utcStrToDate('2024-12-06 19:07:17 +0000 WET')).toEqual(expected)
  })

  it('should apply a positive offset', () => {
    expect(utcStrToDate('2024-12-06 20:07:17 +0100 CET')).toEqual(expected)
    expect(utcStrToDate('2024-12-07 00:37:17 +0530 IST')).toEqual(expected)
  })

  it('should apply a negative offset', () => {
    expect(utcStrToDate('2024-12-06 14:07:17 -0500 EST')).toEqual(expected)
  })

  it('should parse a zone without an alphabetic abbreviation', () => {
    expect(utcStrToDate('2024-12-06 22:07:17 +0300 +03')).toEqual(expected)
  })

  it('should not parse other formats', () => {
    expect(utcStrToDate('2024-12-06T19:07:17Z')).toBe('Invalid UTC Date')
    expect(utcStrToDate('2024-12-06 19:07:17')).toBe('Invalid UTC Date')
    expect(utcStrToDate('not a date')).toBe('Invalid UTC Date')
  })
})

import { isEmpty, getValueAsArray } from './util'

describe('Utils', () => {
  it('isEmpty()', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty(0)).toBe(false)
  })

  it('getValueAsArray()', () => {
    expect(Array.isArray(getValueAsArray('hello world'))).toBe(true)
    expect(Array.isArray(getValueAsArray({}))).toBe(true)
    expect(Array.isArray(getValueAsArray(undefined))).toBe(true)
    expect(Array.isArray(getValueAsArray([]))).toBe(true)
    expect(Array.isArray(getValueAsArray([1, 2, 3]))).toBe(true)
  })
})

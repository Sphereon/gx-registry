/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true
  } else if (typeof value !== 'number' && value === '') {
    return true
  } else if (typeof value === 'undefined' || value === undefined) {
    return true
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true
  } else {
    return false
  }
}

/**
 * @method getObjPropertyByPath
 * @param {Object} o
 * @param {string} path
 * @returns {any} value of o at path
 * @description get a (nested) object property by a string path
 */
export const getObjPropertyByPath = (o: Object, path: string): any => {
  // convert indexes to properties
  // e.g. my.index[3].to.prop becomes my.index.3.to.prop
  path = path.replace(/\[(\w+)\]/g, '.$1')

  // strip a leading dot
  path = path.replace(/^\./, '')

  // create indizie array
  const a = path.split('.')
  for (let i = 0; i < a.length; ++i) {
    const k = a[i]
    // check if k exists on o
    if (k in o) {
      o = o[k]
    }
    // if o is an array check if k is a valid prop of o[i]
    // this allows for chaining like
    // my.path.to.array.and.prop
    // where 'array' can be an array of objects like:
    // [
    //  { and: { prop: 'test' } },
    //  { and: { prop: 'string' } }
    // ]
    else if (Array.isArray(o)) {
      o = o.map(e => {
        if (e && k in e) return e[k]
        return
      })
    } else {
      return
    }
  }

  return o
}

export function getValueAsArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

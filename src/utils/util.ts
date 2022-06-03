import { Certificate } from 'pkijs'

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

export function getValueAsArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function getBufferFromBase64(str: string): ArrayBuffer {
  return Buffer.from(str, 'base64')
}

/**
 * Transforms base64 encoded strings into PKI.js Certificates
 * @param base64Certs the string array containing base64 encoded certificates
 * @returns {[Certificate]} the transformed certificates
 */
export function getCertificatesFromRaw(base64Certs: string[]): Certificate[] {
  const certs = []
  certs.push(...base64Certs.map(cert => Certificate.fromBER(getBufferFromBase64(cert))))

  return certs
}

/**
 * Removes /-----(BEGIN|END) (CERTIFICATE|PKCS7)-----/ and any \n newlines from a given string to unify entries in the DB
 * @param PEMInfo the string (public key) to strip
 * @returns {string} the stripped publicKey
 */
export function stripPEMInfo(PEMInfo: string): string {
  return PEMInfo.replace(/([']*-----(BEGIN|END) (CERTIFICATE|PKCS7)-----[']*|\n)/gm, '')
}

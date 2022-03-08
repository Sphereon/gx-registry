import { ITrustAnchor } from 'interfaces/trustAnchor.interface'
import { logger } from './logger'
import { TTrustAnchorMap } from './TrustAnchorListParser'
import { getObjPropertyByPath } from './util'

type TTrustAnchorResults = {
  [P in keyof TTrustAnchorMap]: (string | string[])[]
}

/**
 * Helper class to parse JS objects and create ITrustAnchors
 */
export default class TrustAnchorObjectParser {
  private anchors: any[]
  private fieldMap: TTrustAnchorMap

  constructor(_anchors: any[], _fieldMap: TTrustAnchorMap) {
    this.anchors = _anchors
    this.fieldMap = _fieldMap
  }

  public parse(): Partial<ITrustAnchor>[] {
    // prepare the results object
    const results: TTrustAnchorResults = {
      name: [],
      publicKey: []
    }

    try {
      this.anchors.map(anchor => {
        for (const field in this.fieldMap) {
          // since fieldMap needs to contain the relative paths to fields
          // we can use our utility helper here
          // note that this can result in string & string[] pushes
          // depending on the structure of the list
          results[field].push(getObjPropertyByPath(anchor, this.fieldMap[field]))
        }
      })
    } catch (e) {
      logger.error(e.message)
    }

    return this.transformResults(results)
  }

  private transformResults(results: TTrustAnchorResults): Partial<ITrustAnchor>[] {
    const trustAnchors: Partial<ITrustAnchor>[] = []

    results.name.forEach((resultName, index) => {
      // names and keys can be either string or string[]
      // check for arrays first and create ITrustAnchors respectively
      const resultPublicKey = results.publicKey[index]

      if (Array.isArray(resultName))
        resultName.forEach((name, i) =>
          trustAnchors.push({
            name: name,
            publicKey: results.publicKey[index][i]
          })
        )
      else {
        if (Array.isArray(resultPublicKey)) {
          resultPublicKey.forEach((publicKey, i) =>
            trustAnchors.push({
              name: resultName[i],
              publicKey: publicKey
            })
          )
        } else {
          // skip if only one value is given.
          // A valid key <> name pair is therefore needed as of now
          if (typeof resultName === 'undefined' || typeof resultPublicKey === 'undefined') return false
          trustAnchors.push({
            name: resultName,
            publicKey: resultPublicKey
          })
        }
      }
    })

    return trustAnchors
  }
}

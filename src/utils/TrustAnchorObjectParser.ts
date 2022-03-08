import { ITrustAnchor } from 'interfaces/trustAnchor.interface'
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
    // simple counter to keep track of all anchors (keys) in the list
    let count = 0
    try {
      this.anchors.map(anchor => {
        for (const field in this.fieldMap) {
          // since fieldMap needs to contain the relative paths to fields
          // we can use our utility helper here
          // note that this can result in string & string[] pushes
          // depending on the structure of the list
          results[field].push(getObjPropertyByPath(anchor, this.fieldMap[field]))
          count++
        }
      })
    } catch (e) {
      throw e
    }

    return this.transformResults(results, count)
  }

  private transformResults(results: TTrustAnchorResults, count: number): Partial<ITrustAnchor>[] {
    const trustAnchors: Partial<ITrustAnchor>[] = []

    for (let i = 0; i < count; i++) {
      // names and keys can be either string or string[]
      // check for arrays first and create ITrustAnchors respectively
      if (Array.isArray(results.name[i])) {
        ;(results.name[i] as string[]).map((name, j) =>
          trustAnchors.push({
            name: name,
            publicKey: (results.publicKey[i] as string[])[j]
          })
        )
      } else if (Array.isArray(results.publicKey[i])) {
        ;(results.publicKey[i] as string[]).map(key =>
          trustAnchors.push({
            name: results.name[i] as string,
            publicKey: key
          })
        )
      } else {
        // skip if only one value is given. A valid key <> name pair
        // is therefore needed as of now
        if (typeof results.name[i] === 'undefined' || typeof results.publicKey[i] === 'undefined') continue
        trustAnchors.push({
          name: results.name[i] as string,
          publicKey: results.publicKey[i] as string
        })
      }
    }

    return trustAnchors
  }
}

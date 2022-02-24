import { ITrustAnchor } from '../interfaces/trustAnchor.interface'
import { XMLParser } from 'fast-xml-parser'
import { getObjPropertyByPath, isEmpty } from './util'
import TrustAnchorObjectParser from './TrustAnchorObjectParser'

export type TTrustAnchorMap = {
  [P in keyof Omit<ITrustAnchor, '_id' | 'list_id' | 'updatedAt'>]?: string
}

export enum ParseTypes {
  XML,
  CSV
}

export default class TrustAnchorListParser {
  // the fetched list file in string format
  private list: string

  // path to the trustAnchorsArray in the parsed list
  // e.g. 'MyAwesomeList.TrustedAnchors'
  // see ./util.ts:getObjPropertyByPath() for details
  private trustAnchorArrayPath: string

  // mapping of trustAnchor data model fields
  // to their respective path in the parsed anchor array
  // e.g. { name: 'Metadata.AdditionalInformation.Name' }
  // see ./util.ts:getObjPropertyByPath() for details
  private trustAnchorMap: TTrustAnchorMap

  private type: ParseTypes

  constructor(_list: string, _type: ParseTypes, _trustAnchorArrayPath: string, _trustAnchorMap?: TTrustAnchorMap) {
    this.list = _list
    this.trustAnchorArrayPath = _trustAnchorArrayPath
    this.trustAnchorMap = _trustAnchorMap
    this.type = _type
  }

  public parse() {
    let trustAnchorsArray: any[]
    switch (this.type) {
      case ParseTypes.CSV:
      // TODO: add CSV parser
      case ParseTypes.XML:
        const xmlParser = new XMLParser()
        const parsedXml = xmlParser.parse(this.list)
        trustAnchorsArray = getObjPropertyByPath(parsedXml, this.trustAnchorArrayPath)
        break
      default:
        throw new Error('ParseType not supported')
    }

    const trustAnchorObjectParser = new TrustAnchorObjectParser(trustAnchorsArray, this.trustAnchorMap)
    const trustAnchors = trustAnchorObjectParser.parse()

    return trustAnchors
  }
}

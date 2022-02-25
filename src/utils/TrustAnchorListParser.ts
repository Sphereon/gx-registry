import { ITrustAnchor } from '../interfaces/trustAnchor.interface'
import { XMLParser } from 'fast-xml-parser'
import { getObjPropertyByPath, isEmpty } from './util'
import TrustAnchorObjectParser from './TrustAnchorObjectParser'
import { parse } from 'csv-parse/sync'

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

  // mapping of trustAnchor data model fields
  // to their respective path in the parsed anchor array
  // e.g. { name: 'Metadata.AdditionalInformation.Name' }
  // see ./util.ts:getObjPropertyByPath() for details
  private trustAnchorMap: TTrustAnchorMap

  // path to the trustAnchorsArray in the parsed list
  // e.g. 'MyAwesomeList.TrustedAnchors'
  // see ./util.ts:getObjPropertyByPath() for details
  // can be omitted for CSV type
  private trustAnchorArrayPath: string

  private type: ParseTypes

  constructor(_list: string, _type: ParseTypes, _trustAnchorMap?: TTrustAnchorMap, _trustAnchorArrayPath?: string) {
    this.list = _list
    this.trustAnchorArrayPath = _trustAnchorArrayPath
    this.trustAnchorMap = _trustAnchorMap
    this.type = _type
  }

  public parse() {
    let trustAnchorsArray: any[]
    switch (this.type) {
      case ParseTypes.CSV:
        // use column headers as object literals and strip whitespaces
        const nonWhitespaceColumnHeaders = header => header.map(col => col.replace(/ /g, ''))
        // if a CSV is the Input, the parsed content will already be the array we are looking for
        trustAnchorsArray = parse(this.list, { columns: nonWhitespaceColumnHeaders })
        break
      case ParseTypes.XML:
        const xmlParser = new XMLParser()
        const parsedXml = xmlParser.parse(this.list)
        // for XML input we need to navigate to the array of anchors first
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

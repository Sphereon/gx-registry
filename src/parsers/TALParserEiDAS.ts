import { ITrustAnchor, ITrustAnchorList } from 'interfaces/trustAnchor.interface'
import TALParser from './TALParser'

export default class TALParserEiDAS implements TALParser {
  trustAnchorList: ITrustAnchorList

  getNextUpdateDate(): Date {
    return new Date()
  }

  getTrustAnchors(): ITrustAnchor[] {
    return []
  }
}

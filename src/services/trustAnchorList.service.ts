import { definedTrustAnchorLists } from '../configs/trustFramwork.json'
import { TCreateTrustAnchorList } from '../interfaces/trustAnchor.interface'

export default class TrustAnchorListService {
  parentLists = definedTrustAnchorLists as TCreateTrustAnchorList[]

  public fetchAllTrustAnchorLists() {
    throw new Error('method not implemented')
  }
}

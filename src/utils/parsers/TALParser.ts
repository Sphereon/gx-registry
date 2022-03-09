import { CreateTrustAnchorDto } from 'dtos/trustAnchor.dto'
import { ITrustAnchorList } from 'interfaces/trustAnchor.interface'

export default abstract class TALParser {
  trustAnchorList: ITrustAnchorList

  constructor(_trustAnchorList: ITrustAnchorList) {
    this.trustAnchorList = _trustAnchorList
  }

  // call regularly to check if the list needs to be fetched & parsed again
  abstract getNextUpdateDate(): Promise<Date>

  // actual parsing of the list, expected output is an array of CreateTrustAnchorDtos
  abstract getTrustAnchors(): Promise<CreateTrustAnchorDto[]>
}

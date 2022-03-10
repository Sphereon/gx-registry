import { CreateTrustAnchorDto } from '../../dtos/trustAnchor.dto'
import { CreateTrustAnchorListDto } from '../../dtos/trustAnchorList.dto'
import { ITrustAnchorList } from '../../interfaces/trustAnchor.interface'
import TrustAnchorList from '../../models/trustAnchorList.model'
import { logger } from '../../utils/logger'

export default abstract class TrustAnchorListParser {
  trustAnchorList: ITrustAnchorList
  trustAnchorListObject: Object

  constructor(_trustAnchorList: ITrustAnchorList, _trustAnchorListObject?: Object) {
    this.trustAnchorList = _trustAnchorList
    if (_trustAnchorListObject) this.trustAnchorListObject = _trustAnchorListObject
  }

  // call regularly to check if the list needs to be fetched & parsed again
  // TODO: this is WIP - decide on implementation
  abstract shouldFetchNow(): boolean

  /**
   * Function to be used by implementing parser classes to
   * actually parse the respective list and return all trust anchors
   * from that list as a CreateTrustAnchorDtos
   *
   * @returns {CreateTrustAnchorDto[]} the found TrustAnchors in the list
   */
  abstract getTrustAnchors(): Promise<CreateTrustAnchorDto[]>

  // helper to create a new TrustAnchorList DB entry
  static async createTrustAnchorList(createTrustAnchorListDto: CreateTrustAnchorListDto): Promise<ITrustAnchorList> {
    try {
      const createTrustAnchorList = await TrustAnchorList.create(createTrustAnchorListDto)

      return createTrustAnchorList
    } catch (error) {
      logger.error(error)
    }
  }
}

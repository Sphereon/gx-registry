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

  /**
   * Decide whether a given TrustAnchorList should be re-fetched or not.
   * Could be called regularly on a schedule to enable automatic "re-fetching" of TrustAnchors.
   *
   * @returns {boolean} if the TrustAnchors from this list should be fetched
   */
  abstract shouldFetchNow(): boolean

  /**
   * Parse the list of this TrustAnchorListParser for TrustAnchors.
   *
   * @returns {CreateTrustAnchorDto[]} the found TrustAnchors in the list
   */
  abstract getTrustAnchors(): Promise<CreateTrustAnchorDto[]>

  /**
   * Create a new TrustAnchorList database entry.
   *
   * @param createTrustAnchorListDto the dto to create the list with
   * @returns {ITrustAnchorList} the created TrustAnchorList
   */
  static async createTrustAnchorList(createTrustAnchorListDto: CreateTrustAnchorListDto): Promise<ITrustAnchorList> {
    try {
      const createTrustAnchorList = await TrustAnchorList.create(createTrustAnchorListDto)

      return createTrustAnchorList
    } catch (error) {
      logger.error(error)
    }
  }
}

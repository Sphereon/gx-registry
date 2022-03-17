import { QueryOptions } from 'mongoose'
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
   * @returns {Promise<ITrustAnchorList>} a promise resolving to the created TrustAnchorList
   */
  static async createTrustAnchorList(createTrustAnchorListDto: CreateTrustAnchorListDto): Promise<ITrustAnchorList> {
    try {
      const createTrustAnchorList = await TrustAnchorList.create(createTrustAnchorListDto)

      return createTrustAnchorList
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * Find and update a TrustAnchorList database entry. If the entry is not found a new one will be created.
   *
   * @param createTrustAnchorListDto the dto to create the list with
   * @returns {Promise<ITrustAnchorList>} a promise resolving to the updated or created TrustAnchorList
   */
  static async findAndUpdateOrCreateTrustAnchorList(createTrustAnchorListDto: CreateTrustAnchorListDto): Promise<ITrustAnchorList> {
    const { uri } = createTrustAnchorListDto
    const options: QueryOptions = { upsert: true, setDefaultsOnInsert: true, new: true }
    const findTrustAnchorList = await TrustAnchorList.findOneAndUpdate({ uri }, createTrustAnchorListDto, options)

    return findTrustAnchorList
  }
}

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { EiDASTrustedListParserService, MozillaCAListParserService, TrustAnchorListParser } from './parsers'
import { TrustAnchorListParserType } from '../../common/interfaces'
import { DEFAULT_UPSERT_OPTIONS } from '../constants'
import { CreateTrustAnchorDto, CreateTrustAnchorListDto } from '../dto'
import { TrustAnchor, TrustAnchorList, TrustAnchorListDocument } from '../schemas'
import { TrustAnchorService } from './trust-anchor.service'

const definedTrustAnchorLists = [
  {
    name: 'eiDAS',
    uri: 'https://ec.europa.eu/tools/lotl/eu-lotl.xml',
    parserClass: 'eiDASParser'
  },
  {
    name: 'DV SSL',
    uri: 'https://ccadb-public.secure.force.com/mozilla/IncludedCACertificateReportPEMCSV',
    parserClass: 'mozillaParser'
  }
]

@Injectable()
export class TrustAnchorListService {
  private readonly logger = new Logger(TrustAnchorListService.name)
  parentLists = definedTrustAnchorLists as CreateTrustAnchorListDto[]

  constructor(
    @InjectModel(TrustAnchorList.name) public trustAnchorListModel: Model<TrustAnchorListDocument>,
    @Inject(forwardRef(() => EiDASTrustedListParserService)) private readonly eiDASParser: EiDASTrustedListParserService,
    private readonly mozillaParser: MozillaCAListParserService,
    private readonly trustAnchorService: TrustAnchorService
  ) {}

  /**
   * Ensure that DB is updated on application launch
   **/
  async onModuleInit() {
    //TODO: check if force = true is necessary
    // force update to ensure eiDAS list and nested lists are checked correctly
    const updated = await this.fetchAllTrustAnchorLists(process.env.NODE_ENV === 'production')

    this.logger.log(` Fetched from ${this.parentLists.length} parent lists and updated ${updated} trust anchors.`)
  }

  /**
   * Fetch all trust anchors, starting from the {@link definedTrustAnchorLists} config
   *
   * @returns {Promise<number>} a promise resolving to the number of updated trust anchors
   */
  async fetchAllTrustAnchorLists(force = false): Promise<number> {
    let allTrustAnchors: CreateTrustAnchorDto[] = []
    try {
      // For each trust anchor list in the config .json
      for (const list of this.parentLists) {
        // find or create the list in the database
        const findTtrustAnchorList = await this.findAndUpdateOrCreateTrustAnchorList(list)

        // fetch the trust anchors from the list with the parser
        const trustAnchors = await this.fetchTrustAnchors(findTtrustAnchorList, force)

        // add them to the allTrustAnchors array
        allTrustAnchors = allTrustAnchors.concat(trustAnchors)
      }
    } catch (error) {
      this.logger.error(error)
    } finally {
      // finally update all found trust anchors
      const updated = await this.trustAnchorService.updateTrustAnchors(allTrustAnchors)

      // and return the number of updated anchors
      return updated
    }
  }

  /**
   * Fetch all TrustAnchors from the TrustAnchorList of this parser.
   *
   * @returns {Promise<TrustAnchor[]>} a promise resolving to the found TrustAnchors in the list
   */
  async fetchTrustAnchors(trustAnchorList: TrustAnchorListDocument, force = false): Promise<TrustAnchor[]> {
    this.logger.log(`Initiate fetchTrustAnchors for ${trustAnchorList.uri}`)
    if (!force && !this.shouldFetchNow(trustAnchorList)) return []

    const parser = this.getListParserForType(trustAnchorList.parserClass)

    return await parser.getTrustAnchors(trustAnchorList)
  }

  /**
   * Find and update a TrustAnchorList database entry. If the entry is not found a new one will be created.
   *
   * @param createTrustAnchorListDto the dto to create the list with
   * @returns {Promise<ITrustAnchorList>} a promise resolving to the updated or created TrustAnchorList
   */
  async findAndUpdateOrCreateTrustAnchorList(createTrustAnchorListDto: CreateTrustAnchorListDto): Promise<TrustAnchorListDocument> {
    const { uri } = createTrustAnchorListDto

    const findTrustAnchorList = await this.trustAnchorListModel.findOneAndUpdate({ uri }, createTrustAnchorListDto, DEFAULT_UPSERT_OPTIONS).exec()

    return findTrustAnchorList
  }

  /**
   * Decide whether a given TrustAnchorList should be re-fetched or not.
   * Could be called regularly on a schedule to enable automatic "re-fetching" of TrustAnchors.
   *
   * @returns {boolean} if the TrustAnchors from this list should be fetched
   */
  // TODO: implement updateCycles rather than hardcoded time difference
  shouldFetchNow(trustAnchorList: TrustAnchorListDocument): boolean {
    if (!trustAnchorList.lastFetchDate) {
      this.logger.debug(`Could not find a lastFetchDate for: ${trustAnchorList.uri}. Should fetch now.`)
      return true
    }

    const diffTime = Math.abs(Date.now() - trustAnchorList.lastFetchDate.getTime())
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    const shouldFetch = diffDays >= 14
    this.logger.debug(
      `${trustAnchorList.uri} was fetched ${diffDays.toFixed(2)} days ago. ${
        shouldFetch ? 'Should fetch again now.' : 'Should not be fetched again.'
      }`
    )

    return shouldFetch
  }

  getListParserForType(type: TrustAnchorListParserType): TrustAnchorListParser {
    return type === 'eiDASParser' ? this.eiDASParser : this.mozillaParser
  }
}

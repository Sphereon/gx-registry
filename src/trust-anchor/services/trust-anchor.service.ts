import { ValidationResult } from 'joi'
import { Cache } from 'cache-manager'
import { Certificate, CertificateChainValidationEngine, CertificateChainValidationEngineVerifyResult, CryptoEngine, setEngine } from 'pkijs'
import { webcrypto } from 'node:crypto'
import { getCertificatesFromRaw, isEmpty } from '../../common/util'
import { BadRequestException, CACHE_MANAGER, ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { TrustStates } from '../../common/interfaces/trustAnchor.interface'
import { TrustAnchorRequestDto } from '../dto/trust-anchor-request.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { TrustAnchor, TrustAnchorDocument } from '../schemas/trust-anchor.schema'
import { CreateTrustAnchorDto } from '../dto/create-trust-anchor.dto'
import { TrustAnchorResponseDto } from '../dto/trust-anchor-response.dto'
import { DEFAULT_UPSERT_OPTIONS } from '../constants/default-upsert.const'

@Injectable()
export class TrustAnchorService {
  private readonly logger = new Logger(TrustAnchorService.name)

  public static readonly CRYPTO_ENGINE_NAME = 'Crypto Engine'
  public static readonly TRUST_ANCHOR_CERTIFICATES_CACHE_KEY = 'TrustAnchorCertificates'

  private trustAnchorCertificateCache: Certificate[] = []

  constructor(
    @InjectModel(TrustAnchor.name) public trustAnchorModel: Model<TrustAnchorDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    // Set PKIjs crypto engine for CertificateChainValidationEngine
    setEngine(TrustAnchorService.CRYPTO_ENGINE_NAME, new CryptoEngine({ name: TrustAnchorService.CRYPTO_ENGINE_NAME, crypto: webcrypto as any }))
  }

  /**
   * Ensure that certificates from DB are cached at onApplicationBootstrap event
   * Will run after onModuleInit() triggered in TrustAnchorListService, to ensure DB is updated
   **/
  async onApplicationBootstrap() {
    if (['development', 'test'].includes(process.env.NODE_ENV)) return

    this.logger.log(`Deleting TrustAnchorCertificates from Cache...`)
    await this.cacheManager.del(TrustAnchorService.TRUST_ANCHOR_CERTIFICATES_CACHE_KEY)

    await this.cacheAllTrustAnchorCertificates()
  }

  /**
   * Validates a chain of X509 certificates
   * @param base64Certs the raw base64 encoded certificate strings
   * @returns {CertificateChainValidationEngineVerifyResult} the verification result
   */
  public async validateCertChain(base64Certs: string[]): Promise<CertificateChainValidationEngineVerifyResult> {
    // Create Certificate instances from raw strings
    try {
      // In general, expect the following order for certificate chains: [leaf - intermediate - root]
      // For the ValidationEngine to work correctly reverse this order to: [root - intermediate - leaf]
      // for details: https://gitlab.com/gaia-x/lab/compliance/gx-registry/-/issues/21
      const certs: Certificate[] = getCertificatesFromRaw(base64Certs).reverse()

      const trustedCerts = await this.retrieveCertificatesFromCache()

      const chainEngine = new CertificateChainValidationEngine({
        certs,
        trustedCerts
      })

      let validationResult = await chainEngine.verify()

      // If the "correct" order was provided try with the initial order again for intermediate trusted certificates
      // for details: https://gitlab.com/gaia-x/lab/compliance/gx-registry/-/issues/21
      if (validationResult.result === false) {
        this.logger.log('Trying chain validation in reversed order for intermediate certificates...')
        const chainEngineReversed = new CertificateChainValidationEngine({
          certs: certs.reverse(),
          trustedCerts
        })

        validationResult = await chainEngineReversed.verify()
      }

      return validationResult
    } catch (error) {
      this.logger.error(error)
      throw new ConflictException('Certificate Chain could not be validated.')
    }
  }

  /**
   * Retrieve all trustAnchors from the database
   * @returns {Promise<TrustAnchor[]>} the trustAnchors found in the DB
   */
  public async getAllTrustAnchors(): Promise<TrustAnchor[]> {
    return await this.trustAnchorModel.find().exec()
  }

  /**
   * Searches for a trustAnchor in the database given a certain certificate and returns a trustAnchorResponse if one was found.
   * Will throw a 404 exception in case no trustAnchor could be retrieved from the database.
   * @param trustAnchorData the body containing a certificate
   * @returns {Promise<ITrustAnchorResponse>} the prepared trustAnchorResponse
   */
  public async findTrustAnchor(trustAnchorData: ValidationResult<TrustAnchorRequestDto>['value']): Promise<TrustAnchorResponseDto> {
    if (isEmpty(trustAnchorData)) throw new BadRequestException('Request body invalid.')
    const { certificate } = trustAnchorData
    const findTrustAnchor = await this.trustAnchorModel.findOne({ certificate }).exec()

    if (!findTrustAnchor) throw new NotFoundException('Trust Anchor not found.')

    const response = await this.prepareTrustAnchorResponse(findTrustAnchor)

    return response
  }

  /**
   * Prepares a trustAnchorResponse given a certain trustAnchor
   * @param trustAnchor the trustAnchor to prepare the response object for
   * @returns {Promise<ITrustAnchorResponse>} the prepared trustAnchorResponse
   */
  private async prepareTrustAnchorResponse(trustAnchor: TrustAnchorDocument): Promise<TrustAnchorResponseDto> {
    const trustAnchorResponse: TrustAnchorResponseDto = {
      trustState: TrustStates.Trusted,
      trustedForAttributes: new RegExp('.*', 'gm').toString(),
      trustedAt: trustAnchor.lastTimeOfTrust?.getTime()
    }

    return trustAnchorResponse
  }

  /**
   * Update TrustAnchors in the DB from a given {@link CreateTrustAnchorDto} array
   * @param {CreateTrustAnchorDto[]} trustAnchors the trust anchors to update
   * @param {Object} options an options object
   * @param {QueryOptions} options query options to be passed to the database update call
   * @returns {Promise<number>} a promise resolving to the number of db entries that were updated
   */
  async updateTrustAnchors(trustAnchors: CreateTrustAnchorDto[], options = DEFAULT_UPSERT_OPTIONS) {
    const mongoPromises = []
    for (const ta of trustAnchors) {
      // find trustAnchors by certificate & _list id
      const { certificate, _list } = ta
      const updatePromise = this.trustAnchorModel
        .findOneAndUpdate({ certificate, _list }, ta, options)
        .exec()
        .catch(e => this.logger.error(e))
      mongoPromises.push(updatePromise)
    }

    await Promise.all(mongoPromises)

    return mongoPromises.length
  }

  /**
   * Cache all TrustAnchor certificates found in DB
   * @returns {Promise<Certificate[]>} all cached certificates
   */
  async cacheAllTrustAnchorCertificates(): Promise<Certificate[]> {
    this.logger.log('Re-caching TrustAnchor certificates...')
    const trustAnchors = await this.getAllTrustAnchors()
    const certificatesRaw = trustAnchors.map(ta => ta.certificate)
    const certificates = getCertificatesFromRaw(certificatesRaw)

    await this.cacheManager.set<Certificate[]>(TrustAnchorService.TRUST_ANCHOR_CERTIFICATES_CACHE_KEY, certificates, { ttl: 0 })
    this.logger.log(`Cached ${certificates.length} TrustAnchor certificates.`)

    return certificates
  }

  /**
   * Retrieve all TrustAnchor certificates stored in the cache
   * Will set the respective cache key, if not set already
   * @returns {Promise<Certificate[]>} all cached certificates
   */
  async retrieveCertificatesFromCache(): Promise<Certificate[]> {
    this.logger.debug('Retrieving TrustAnchor certificates from cache...')
    const trustAnchorCertificates = await this.cacheManager.get<Certificate[]>(TrustAnchorService.TRUST_ANCHOR_CERTIFICATES_CACHE_KEY)

    this.logger.debug(`Got ${trustAnchorCertificates?.length} cached items`)

    return trustAnchorCertificates || (await this.cacheAllTrustAnchorCertificates())
  }
}

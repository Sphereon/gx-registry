import { ValidationResult } from 'joi'
import { TTrustAnchorRequest } from '../dtos/trustAnchor.dto'
import { HttpException } from '../exceptions/HttpException'
import { ITrustAnchor, ITrustAnchorResponse, TCreateTrustAnchor, TrustStates } from '../interfaces/trustAnchor.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'
import { logger } from '../utils/logger'
import { getBufferFromBase64, getCertificatesFromRaw, isEmpty } from '../utils/util'
import { Certificate, CertificateChainValidationEngine, CertificateChainValidationEngineVerifyResult, CryptoEngine, setEngine } from 'pkijs'
import { webcrypto } from 'node:crypto'

class TrustAnchorService {
  public trustAnchor = TrustAnchor
  public trustAnchorList = TrustAnchorList

  public static readonly CRYPTO_ENGINE_NAME = 'Crypto Engine'

  private trustAnchorCertificateCache: Certificate[] = []

  constructor() {
    // Set PKIjs crypto engine for CertificateChainValidationEngine
    setEngine(TrustAnchorService.CRYPTO_ENGINE_NAME, new CryptoEngine({ name: TrustAnchorService.CRYPTO_ENGINE_NAME, crypto: webcrypto }))
  }

  /**
   * Validates a chain of X509 certificates
   * @param base64Certs the raw base64 encoded certificate strings
   * @returns {CertificateChainValidationEngineVerifyResult} the verification result
   */
  public async validateCertChain(base64Certs: string[]): Promise<CertificateChainValidationEngineVerifyResult> {
    // Create Certificate instances from raw strings
    try {
      const certs: Certificate[] = getCertificatesFromRaw(base64Certs)

      const trustedCerts = await this.getAllTrustAnchorCertificates()

      const chainEngine = new CertificateChainValidationEngine({
        certs,
        trustedCerts
      })

      const validationResult = await chainEngine.verify()

      logger.debug(validationResult)

      return validationResult
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * Retrieve all trustAnchors from the database
   * @returns {Promise<ITrustAnchor[]>} the trustAnchors found in the DB
   */
  public async getAllTrustAnchors(): Promise<ITrustAnchor[]> {
    return await TrustAnchor.find()
  }

  /**
   * Prepare and transform all certificates known to the registry as pkijs.Certificate array
   * @returns {Promise<Certificate[]>} the transformed certificates retrieved from the DB
   */
  public async getAllTrustAnchorCertificates(): Promise<Certificate[]> {
    if (this.trustAnchorCertificateCache.length > 0) return this.trustAnchorCertificateCache
    const trustAnchors = await this.getAllTrustAnchors()

    this.trustAnchorCertificateCache = trustAnchors.map(ta => Certificate.fromBER(getBufferFromBase64(ta.publicKey)))

    return this.trustAnchorCertificateCache
  }

  /**
   * Searches for a trustAnchor in the database given a certain publicKey and returns a trustAnchorResponse if one was found.
   * Will throw a 404 exception in case no trustAnchor could be retrieved from the database.
   * @param trustAnchorData the body containing a publicKey
   * @returns {Promise<ITrustAnchorResponse>} the prepared trustAnchorResponse
   */
  public async findTrustAnchor(trustAnchorData: ValidationResult<TTrustAnchorRequest>['value']): Promise<ITrustAnchorResponse> {
    if (isEmpty(trustAnchorData)) throw new HttpException(400, 'Request body invalid.')

    const findTrustAnchor: ITrustAnchor = await this.trustAnchor.findOne({ publicKey: trustAnchorData.publicKey })

    if (!findTrustAnchor) throw new HttpException(404, 'Trust Anchor not found.')

    const response = await this.prepareTrustAnchorResponse(findTrustAnchor)

    return response
  }

  /**
   * Prepares a trustAnchorResponse given a certain trustAnchor
   * @param trustAnchor the trustAnchor to prepare the response object for
   * @returns {Promise<ITrustAnchorResponse>} the prepared trustAnchorResponse
   */
  private async prepareTrustAnchorResponse(trustAnchor: ITrustAnchor): Promise<ITrustAnchorResponse> {
    const trustAnchorResponse: ITrustAnchorResponse = {
      trustState: TrustStates.Trusted,
      trustedForAttributes: new RegExp('.*', 'gm').toString(),
      trustedAt: trustAnchor.lastTimeOfTrust?.getTime()
    }

    return trustAnchorResponse
  }

  /**
   * Update TrustAnchors in the DB from a given {@link TCreateTrustAnchor} array
   * @param {TCreateTrustAnchor[]} trustAnchors the trust anchors to update
   * @param {Object} options an options object
   * @param {boolean} options.upsert if new trust anchors should be inserted
   * @returns {Promise<number>} a promise resolving to the number of db entries that were updated
   */
  static async updateTrustAnchors(trustAnchors: TCreateTrustAnchor[], { upsert } = { upsert: true }) {
    const mongoPromises = []
    for (const ta of trustAnchors) {
      // find trustAnchors by publicKey & _list id
      const { publicKey, _list } = ta
      const updatePromise = TrustAnchor.findOneAndUpdate({ publicKey, _list }, ta, { upsert: upsert }).catch(e => logger.error(e))
      mongoPromises.push(updatePromise)
    }

    await Promise.all(mongoPromises)

    return mongoPromises.length
  }
}

export default TrustAnchorService

import { Request, Response, Router } from 'express'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import TrustAnchor from '../models/trustAnchor.model'
import EiDASTrustedListParser from '../utils/parsers/EiDASTrustedListParser'
import { logger } from '../utils/logger'
import TrustAnchorListParser from '../utils/parsers/TrustAnchorListParser'
import MozillaCAListParser from '../utils/parsers/MozillaCAListParser'
import { TCreateTrustAnchor, TCreateTrustAnchorList } from '../interfaces/trustAnchor.interface'
import { trustAnchorRequestSchema } from '../dtos/trustAnchor.dto'
import TrustAnchorList from '../models/trustAnchorList.model'

class TrustAnchorRoute implements Routes {
  public path = '/api/trustAnchor'
  public router = Router()
  public trustAnchorController = new TrustAnchorController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // TODO: remove GET route
    this.router.get(`${this.path}`, this.parseXml)
    this.router.get(`${this.path}/csv`, this.parseCsv)
    this.router.post(`${this.path}`, validationMiddleware(trustAnchorRequestSchema, 'body'), this.trustAnchorController.getTrustAnchor)
  }

  // TODO: refactor into unit tests
  // ONLY used for testing. Currently fetches all lists on the lotl
  // and stores the TSPs into the DB as TrustAnchors
  private async parseXml(req: Request, res: Response) {
    console.log('REQUESTED parse XML')
    const createTalDto = await EiDASTrustedListParser.getCreateTrustAnchorListDto('https://ec.europa.eu/tools/lotl/eu-lotl.xml')
    console.log('createDto:', createTalDto)
    const findTtrustAnchorList = await EiDASTrustedListParser.findAndUpdateOrCreateTrustAnchorList(createTalDto)
    console.log('findTal:', findTtrustAnchorList)
    const parser = new EiDASTrustedListParser(findTtrustAnchorList)

    const trustAnchors = await parser.fetchTrustAnchors()

    await TrustAnchorRoute.updateTrustAnchors(trustAnchors)

    const eiDASTAQuery = TrustAnchor.count({ _list: { $in: await TrustAnchorList.distinct('_id', { parserClass: 'eiDASParser' }) } })

    return res.status(200).json({
      message: 'Successfully fetched Trust Anchors from EC LOTL',
      eiDASTalId: findTtrustAnchorList._id,
      availableTrustAnchorsEiDAS: await eiDASTAQuery,
      availableTrustAnchors: await TrustAnchor.count()
    })
  }

  // TODO: refactor to one global function, duplicated for now
  // TODO: move parent lists to a config file
  // ONLY used for testing. Currently fetches hardcoded csv file
  // and stores the CAs into the DB as TrustAnchors
  private async parseCsv(req: Request, res: Response) {
    const mozillaCaUri = 'https://ccadb-public.secure.force.com/mozilla/IncludedCACertificateReportPEMCSV'

    const createTalDto: TCreateTrustAnchorList = {
      uri: mozillaCaUri,
      name: 'Mozilla Domain Validated (DV) Secure Sockets Layer (SSL) certificate issuers',
      parserClass: 'mozillaParser'
    }

    const findTtrustAnchorList = await TrustAnchorListParser.findAndUpdateOrCreateTrustAnchorList(createTalDto)
    const parser = new MozillaCAListParser(findTtrustAnchorList)

    const trustAnchors = await parser.fetchTrustAnchors()
    await TrustAnchorRoute.updateTrustAnchors(trustAnchors)

    return res.status(200).json({
      message: 'Successfully fetched Trust Anchors from Mozilla CA list',
      availableTrustAnchorsMozillaCa: await TrustAnchor.count({ _list: findTtrustAnchorList._id }),
      availableTrustAnchorsTotal: await TrustAnchor.count()
    })
  }

  static async updateTrustAnchors(trustAnchors: TCreateTrustAnchor[]) {
    for (const ta of trustAnchors) {
      // find trustAnchors by publicKey & _list id
      const { publicKey, _list } = ta
      try {
        await TrustAnchor.findOneAndUpdate({ publicKey, _list }, ta, { upsert: true })
      } catch (e) {
        logger.error(e)
        continue
      }
    }
  }
}

export default TrustAnchorRoute

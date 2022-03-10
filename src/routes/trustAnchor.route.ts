import { Request, Response, Router } from 'express'
import { RequestTrustAnchorDto } from '../dtos/trustAnchor.dto'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import TrustAnchor from '../models/trustAnchor.model'
import EiDASTrustedListParser from '../utils/parsers/EiDASTrustedListParser'
import { logger } from '../utils/logger'

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
    this.router.post(`${this.path}`, validationMiddleware(RequestTrustAnchorDto, 'body'), this.trustAnchorController.getTrustAnchor)
  }

  // TODO: refactor into unit tests
  // ONLY used for testing. Currently fetches all lists on the lotl
  // and stores the TSPs into the DB as TrustAnchors
  private async parseXml(req: Request, res: Response) {
    const createTalDto = await EiDASTrustedListParser.getCreateTrustAnchorListDto('https://ec.europa.eu/tools/lotl/eu-lotl.xml')
    console.log('createDto:', createTalDto)
    const findTtrustAnchorList = await EiDASTrustedListParser.findAndUpdateOrCreateTal(createTalDto)
    console.log('findTal:', findTtrustAnchorList)
    const parser = new EiDASTrustedListParser(findTtrustAnchorList)

    const trustAnchors = await parser.getTrustAnchors()

    for (const ta of trustAnchors) {
      const { name, ...query } = ta
      try {
        await TrustAnchor.findOneAndUpdate(query, ta, { upsert: true })
      } catch (e) {
        logger.error(e)
        continue
      }
    }

    return res.status(200).json({
      message: 'Successfully fetched Trust Anchors from EC LOTL',
      availableTrustAnchors: (await TrustAnchor.find()).length
    })
  }
}

export default TrustAnchorRoute

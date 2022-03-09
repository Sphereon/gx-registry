import { Request, Response, Router } from 'express'
import { RequestTrustAnchorDto } from '../dtos/trustAnchor.dto'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'
import TALParserEiDAS from '../utils/parsers/TALParserEiDAS'
import { logger } from '../utils/logger'

class TrustAnchorRoute implements Routes {
  public path = '/api/trustAnchor'
  public router = Router()
  public trustAnchorController = new TrustAnchorController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    //this.router.get(`${this.path}`, this.addToDb)
    this.router.get(`${this.path}`, this.parseXml)
    this.router.post(`${this.path}`, validationMiddleware(RequestTrustAnchorDto, 'body'), this.trustAnchorController.getTrustAnchor)
  }

  //TODO: remove after testing
  private async addToDb(req: Request, res: Response) {
    const trustAnchorList = TrustAnchorList
    const trustAnchor = TrustAnchor

    const list = await trustAnchorList.create({
      name: 'Example Trusted List',
      location: 'https://example.com',
      type: 'CSV',
      updateCycle: 604800000 // 1 week
    })

    const inserted = await trustAnchor.insertMany([
      {
        name: 'Anchor #1',
        _list: list._id,
        publicKey: '1234567890'
      },
      {
        name: 'Trust Anchor #2',
        _list: list._id,
        publicKey: '0987654321'
      }
    ])

    return res.status(200).json(inserted)
  }

  //TODO: remove after testing
  private async parseXml(req: Request, res: Response) {
    return res.status(200).json({
      message: 'Successfully fetched Trust Anchors from EC LOTL',
      availableTrustAnchors: (await TrustAnchor.find()).length
    })

    const findTtrustAnchorList = await TrustAnchorList.findById('622770ccc194716ac6e2566c')
    const parser = new TALParserEiDAS(findTtrustAnchorList)
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

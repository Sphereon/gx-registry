import { RequestTrustAnchorDto } from '../dtos/trustAnchor.dto'
import { Request, Response, Router } from 'express'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'

class TrustAnchorRoute implements Routes {
  public path = '/api/trustAnchor'
  public router = Router()
  public trustAnchorController = new TrustAnchorController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    //this.router.get(`${this.path}`, this.addToDb)
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
        list_id: list._id,
        publicKey: '1234567890'
      },
      {
        name: 'Trust Anchor #2',
        list_id: list._id,
        publicKey: '0987654321'
      }
    ])

    return res.status(200).json(inserted)
  }
}

export default TrustAnchorRoute

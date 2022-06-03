import { Router } from 'express'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import { trustAnchorRequestSchema } from '../dtos/trustAnchor.dto'
import { certificateChainRequestSchema } from '../dtos/certificateChain.dto'
import certificateChainMiddleware from '../middlewares/certificateChain.middleware'

class TrustAnchorRoute implements Routes {
  public path = '/api/trustAnchor'
  public router = Router()
  public trustAnchorController = new TrustAnchorController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, validationMiddleware(trustAnchorRequestSchema, 'body'), this.trustAnchorController.getTrustAnchor)
    this.router.post(
      `${this.path}/chain`,
      [validationMiddleware(certificateChainRequestSchema, 'body'), certificateChainMiddleware()],
      this.trustAnchorController.verifyCertificateChain
    )
  }
}

export default TrustAnchorRoute

import { NextFunction, Request, Response } from 'express'
import TrustAnchorService from '../services/trustAnchor.service'

class TrustAnchorController {
  trustAnchorService = new TrustAnchorService()

  public getTrustAnchor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trustAnchorResponse = await this.trustAnchorService.findTrustAnchor(req.body)
      res.status(200).json(trustAnchorResponse)
    } catch (error) {
      next(error)
    }
  }

  public verifyCertificateChain = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const verificationResult = await this.trustAnchorService.validateCertChain(req.body.certs)

      const { result } = verificationResult

      const response = result ? { result } : verificationResult

      res.status(result ? 200 : 409).send(response)
    } catch (error) {
      next(error)
    }
  }
}

export default TrustAnchorController

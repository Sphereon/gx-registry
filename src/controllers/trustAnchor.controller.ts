import { NextFunction, Request, Response } from 'express'
import TrustAnchorService from '../services/trustAnchor.service'

class TrustAnchorController {
  trustAnchorService = new TrustAnchorService()

  public getTrustAnchor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trustAnchor = await this.trustAnchorService.findTrustAnchor(req.body)
      res.status(200).json({ data: trustAnchor, message: 'Trust Anchor found in registry.' })
    } catch (error) {
      next(error)
    }
  }
}

export default TrustAnchorController

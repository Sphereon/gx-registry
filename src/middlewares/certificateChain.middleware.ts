import { RequestHandler } from 'express'
import { HttpException } from '../exceptions/HttpException'
import { stripPEMInfo } from '../utils/util'
import { logger } from '../utils/logger'

const certificateChainMiddleware = (): RequestHandler => {
  return (req, res, next) => {
    try {
      const certs: string = req.body.certs

      // split string into 1 item per certificate
      const split = certs.split('-----BEGIN CERTIFICATE-----')
      // remove BEGIN CERTIFICATE etc. and filter empty leftover strings
      const raw = split.map(c => stripPEMInfo(c)).filter(c => c.length > 1)

      req.body = { certs: raw }

      logger.debug('Transformed certificates:')
      logger.debug({ certs, raw })
      next()
    } catch (error) {
      logger.error(error)
      const message = 'Certificate chain could not be transformed.'
      next(new HttpException(400, message))
    }
  }
}

export default certificateChainMiddleware

import { NextFunction, Request, Response } from 'express'
import { version, name, description, repository, bugs } from '../../package.json'
import { SWAGGER_UI_PATH } from '../app'

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      const info = {
        software: name,
        description,
        version,
        documentation: `${process.env.BASE_URL}${SWAGGER_UI_PATH}`,
        repository,
        bugs
      }

      res.json(info)
    } catch (error) {
      next(error)
    }
  }
}

export default IndexController

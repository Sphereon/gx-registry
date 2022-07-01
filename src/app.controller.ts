import { Controller, Get } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { name, description, version, repository, bugs } from '../package.json'
import { SWAGGER_UI_PATH } from './common/util/swagger.util'

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  getDescription() {
    return {
      software: name,
      description,
      version,
      documentation: `${process.env.BASE_URL}/${SWAGGER_UI_PATH}`,
      repository,
      bugs
    }
  }
}

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RequestMethod } from '@nestjs/common'
import { setupSwagger } from './common/util'
import { replaceShapeContextBaseUri } from './common/util/replaceInFile'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('/api/', {
    exclude: [{ path: '/', method: RequestMethod.GET }]
  })

  setupSwagger(app)

  app.enableCors()
  await app.listen(process.env.PORT || 3000)
  replaceShapeContextBaseUri()
}

bootstrap()

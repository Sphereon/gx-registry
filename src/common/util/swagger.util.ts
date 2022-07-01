import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'fs'
import * as path from 'path'
import { name, version, description } from '../../../package.json'
import { TrustAnchorModuleV1 } from '../../trust-anchor/trust-anchor-v1.module'
import { TrustAnchorModule } from '../../trust-anchor/trust-anchor.module'

export const OPEN_API_DOC_PATH = path.resolve(process.cwd(), 'openapi.json')

export const SWAGGER_UI_PATH = 'docs'

const options = {
  tagsSorter: 'alpha',
  operationsSorter: 'alpha',
  customCss: `.curl-command { display: none } .swagger-ui .topbar { display: none }; `
}

const versions = [
  {
    number: '1.0.1',
    includedModules: [TrustAnchorModuleV1]
  },
  {
    number: version,
    latest: true,
    includedModules: [TrustAnchorModule]
  }
]

export function setupSwagger(app: INestApplication) {
  for (const version of versions) {
    const config = new DocumentBuilder().setTitle(name).setDescription(description).setVersion(version.number).addTag('TrustAnchor').build()

    const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: false, include: version.includedModules })

    const versionPath = `v${version.number.split('.')[0]}`

    writeFileSync(version.latest ? OPEN_API_DOC_PATH : OPEN_API_DOC_PATH.replace('.json', `-${versionPath}.json`), JSON.stringify(document), {
      encoding: 'utf8'
    })

    SwaggerModule.setup(`${SWAGGER_UI_PATH}/${versionPath}`, app, document, options)

    if (version.latest) SwaggerModule.setup(SWAGGER_UI_PATH, app, document, options)
  }
}

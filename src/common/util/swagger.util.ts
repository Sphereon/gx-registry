import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'fs'
import * as path from 'path'
import { ComplianceIssuersModule } from '../../compliance-issuers/compliance-issuers.module'
import { name, version, description } from '../../../package.json'
import { ShapeModule2206 } from '../../shape/shape.module'
import { TermsAndConditionsModule } from '../../terms-and-conditions/terms-and-conditions.module'
import { TrustAnchorModule } from '../../trust-anchor/trust-anchor.module'

export const OPEN_API_DOC_PATH = path.resolve(process.cwd(), 'openapi.json')

export const SWAGGER_UI_PATH = 'v2206/docs'

const options = {
  tagsSorter: 'alpha',
  operationsSorter: 'alpha',
  customCss: `.curl-command { display: none } .swagger-ui .topbar { display: none }; `
}

const versions = [
  {
    number: version,
    latest: true,
    includedModules: [TrustAnchorModule, TermsAndConditionsModule, ShapeModule2206, ComplianceIssuersModule]
  }
]

export function setupSwagger(app: INestApplication) {
  for (const version of versions) {
    const config = new DocumentBuilder().setTitle(name).setDescription(description).setVersion(version.number).build()

    const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: false, include: version.includedModules })

    const versionPath = `v${version.number.split('.')[0]}`

    writeFileSync(version.latest ? OPEN_API_DOC_PATH : OPEN_API_DOC_PATH.replace('.json', `-${versionPath}.json`), JSON.stringify(document), {
      encoding: 'utf8'
    })

    SwaggerModule.setup(`${SWAGGER_UI_PATH}/${versionPath}`, app, document, options)

    if (version.latest) SwaggerModule.setup(SWAGGER_UI_PATH, app, document, options)
  }
}

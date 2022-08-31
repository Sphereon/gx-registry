import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { TermsAndConditionsModule } from './terms-and-conditions.module'
import { AppModule } from '../app.module'
import supertest from 'supertest'
import { termsAndConditions } from './constants'

describe('TrustAnchor (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, TermsAndConditionsModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  const termsAndConditionsPath = '/termsAndConditions'
  describe.skip(`GET ${termsAndConditionsPath}`, () => {
    it('should return a list of available versions', async () => {
      const result = await supertest(app.getHttpServer()).get(termsAndConditionsPath).send().expect(200)
      expect(Array.isArray(result.body)).toBe(true)
    })
    it('should return an object containing version, text of terms and conditions and hash of the text', async () => {
      const versionKey = Object.keys(termsAndConditions)[0]
      const version = `?version=${versionKey}`
      const result = await supertest(app.getHttpServer())
        .get(termsAndConditionsPath + version)
        .send()
        .expect(200)

      expect(result.body).toMatchObject(termsAndConditions[versionKey])
    })
  })
})

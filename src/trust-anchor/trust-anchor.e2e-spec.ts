import { Test } from '@nestjs/testing'
import { INestApplication, NotImplementedException } from '@nestjs/common'
import { TrustAnchorModule } from './trust-anchor.module'
import { AppModule } from '../app.module'

describe('TrustAnchor (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, TrustAnchorModule]
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  //TODO: implement tests
  describe(`Trust Anchor (e2e)`, () => {
    it.skip('Validates a correct trust anchor', async () => {
      throw new NotImplementedException()
    })
  })
})

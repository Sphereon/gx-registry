import { Test, TestingModule } from '@nestjs/testing'
import { ComplianceIssuersController } from './compliance-issuers.controller'
import { ComplianceIssuersService } from './compliance-issuers.service'

describe('ComplianceIssuersController', () => {
  let controller: ComplianceIssuersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplianceIssuersController],
      providers: [ComplianceIssuersService]
    }).compile()

    controller = module.get<ComplianceIssuersController>(ComplianceIssuersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

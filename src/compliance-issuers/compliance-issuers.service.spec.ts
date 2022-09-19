import { Test, TestingModule } from '@nestjs/testing'
import { ComplianceIssuersService } from './compliance-issuers.service'

describe('ComplianceIssuersService', () => {
  let service: ComplianceIssuersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplianceIssuersService]
    }).compile()

    service = module.get<ComplianceIssuersService>(ComplianceIssuersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

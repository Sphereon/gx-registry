import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ComplianceIssuersService } from './compliance-issuers.service'
import { ComplianceIssuersResponse } from './decorators'

@ApiTags('ComplianceIssuers')
@Controller('complianceIssuers')
export class ComplianceIssuersController {
  constructor(private readonly complianceIssuersService: ComplianceIssuersService) {}

  @ComplianceIssuersResponse('Get the valid DIDs which are allowed to issue GX Compliance VCs.')
  @Get()
  findAll(): string[] {
    return this.complianceIssuersService.findAll()
  }
}

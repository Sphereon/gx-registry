import { Module } from '@nestjs/common'
import { ComplianceIssuersService } from './compliance-issuers.service'
import { ComplianceIssuersController } from './compliance-issuers.controller'

@Module({
  controllers: [ComplianceIssuersController],
  providers: [ComplianceIssuersService]
})
export class ComplianceIssuersModule {}

import { Module } from '@nestjs/common'
import { TermsAndConditionsService } from './services'
import { TermsAndConditionsController } from './terms-and-conditions.controller'

@Module({
  imports: [],
  controllers: [TermsAndConditionsController],
  providers: [TermsAndConditionsService]
})
export class TermsAndConditionsModule {}

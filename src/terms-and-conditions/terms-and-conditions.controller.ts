import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TermsAndConditionsService } from './services'
import { JoiValidationPipe } from '../common/pipes'
import { versionSchema } from './schemas/version.schema'
import { TermsAndConditionsApiResponse } from './decorators'
import { termsAndConditions } from './constants'
import { TermsAndConditionsRequestDto } from './dto'

@ApiTags('TermsAndConditions')
@Controller({ path: 'termsAndConditions', version: '2' })
export class TermsAndConditionsController {
  constructor(private readonly termsAndConditionsService: TermsAndConditionsService) {}

  @TermsAndConditionsApiResponse(
    'Get terms and conditions for specified version or a list of available versions when no version is specified.',
    Object.keys(termsAndConditions)
  )
  @UsePipes(new JoiValidationPipe(versionSchema))
  @Get()
  async getTermsAndConditions(@Query() query: TermsAndConditionsRequestDto) {
    const { version } = query
    return version
      ? this.termsAndConditionsService.getTermsAndConditionsByVersion(version)
      : this.termsAndConditionsService.getAvailableTermsAndConditions()
  }
}

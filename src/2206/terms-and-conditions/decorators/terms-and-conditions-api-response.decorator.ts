import { applyDecorators } from '@nestjs/common'
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger'

export function TermsAndConditionsApiResponse(summary: string, availableVersions: Array<string>) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiQuery({ name: 'version', enum: availableVersions, required: false }),
    ApiBadRequestResponse({ description: 'Invalid request query' }),
    ApiOkResponse({ description: 'The version, terms and conditions text and the sha256 of the text.' })
  )
}

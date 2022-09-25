import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

export function ComplianceIssuersResponse(summary: string) {
  return applyDecorators(ApiOperation({ summary }), ApiOkResponse({ description: 'A list of valid compliance issuers.' }))
}

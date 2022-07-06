import { applyDecorators } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export function TrustAnchorApiResponse(summary: string, dto: any, examples?: ExamplesObject) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiBody({ type: dto, examples, description: summary }),
    ApiBadRequestResponse({ description: 'Invalid request payload' }),
    ApiOkResponse({ description: `TrustAnchor or root for chain was found in the registry` })
  )
}

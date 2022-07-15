import { applyDecorators } from '@nestjs/common'
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { availableShapeFiles } from '../constants'

export function ShapeApiResponse(summary: string) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiQuery({ name: 'file', enum: availableShapeFiles, required: false }),
    ApiQuery({ name: 'type', enum: ['ttl', 'jsonld'], required: false }),
    ApiBadRequestResponse({ description: 'Invalid request query' }),
    ApiOkResponse({ description: 'SHACL file as ttl or jsonld or a list of available files when no file is specified.' }) // TODO add me
  )
}

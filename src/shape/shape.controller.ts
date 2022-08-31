import { Controller, Get, Query, UsePipes, StreamableFile, Response } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ShapeService2206 } from './services'
import { JoiValidationPipe } from '../common/pipes'
import { shapeSchema } from './schemas'
import { ShapeFilesApiResponse } from './decorators'
import { ShapeRequestDto } from './dto'

@ApiTags('Shape')
@Controller({ path: 'shape', version: '2206' })
export class ShapeController2206 {
  constructor(private readonly shapesService: ShapeService2206) {}

  @ApiOperation({ summary: 'Get a JSONLD context for all available shapes.' })
  @ApiOkResponse({ description: 'The JSONLD context for all available shapes in the registry.' })
  @Get()
  async getContext(): Promise<any> {
    return this.shapesService.getJsonldContext(2206)
  }

  @ShapeFilesApiResponse('Get specified SHACL file as ttl or jsonld or a list of all available shapes if no file and type is specified.')
  @UsePipes(new JoiValidationPipe(shapeSchema))
  @Get('files')
  async getShape(@Query() query: ShapeRequestDto, @Response({ passthrough: true }) res): Promise<StreamableFile | Array<string>> {
    const { file, type } = query

    if (file) {
      res.set({ 'Content-Disposition': `attachment; filename="${file}.${type}"` })
      return this.shapesService.getFileByType(file, type)
    }

    return this.shapesService.getAvailableShapeFiles()
  }
}

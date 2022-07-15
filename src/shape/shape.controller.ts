import { Controller, Get, Query, UsePipes, StreamableFile, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ShapeService } from './services'
import { JoiValidationPipe } from '../common/pipes'
import { shapeSchema } from './schemas'
import { ShapeApiResponse } from './decorators'
import { ShapeRequestDto } from './dto'

@ApiTags('Shape')
@Controller({ path: 'shape', version: '2204' })
export class ShapeController {
  constructor(private readonly shapesService: ShapeService) {}

  @ShapeApiResponse('Get specified SHACL file as ttl or jsonld or a context of all available shapes if file and type is specified.')
  @UsePipes(new JoiValidationPipe(shapeSchema))
  @Get()
  async getShape(@Query() query: ShapeRequestDto, @Response({ passthrough: true }) res): Promise<StreamableFile | Array<string>> {
    const { file, type } = query

    if (file) {
      res.set({ 'Content-Disposition': `attachment; filename="${file}.${type}"` })
      return this.shapesService.getFileByType(file, type)
    }

    return this.shapesService.getJsonldContext(2204)
  }
}

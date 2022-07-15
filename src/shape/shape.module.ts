import { Module } from '@nestjs/common'
import { ShapeService } from './services'
import { ShapeController } from './shape.controller'

@Module({
  imports: [],
  controllers: [ShapeController],
  providers: [ShapeService]
})
export class ShapeModule {}

import { Module } from '@nestjs/common'
import { ShapeService2206 } from './services'
import { ShapeController2206 } from './shape.controller'

@Module({
  imports: [],
  controllers: [ShapeController2206],
  providers: [ShapeService2206]
})
export class ShapeModule2206 {}

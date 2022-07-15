import { FileTypes } from '../constants'

export class ShapeRequestDto {
  readonly file: string
  readonly type: FileTypes
}

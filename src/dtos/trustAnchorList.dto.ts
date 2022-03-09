import { IsNumber, IsOptional, IsString } from 'class-validator'
import { TAL_PARSING_CLASSES } from 'interfaces/trustAnchor.interface'

export class CreateTrustAnchorListDto {
  @IsString()
  public name: string

  @IsString()
  public uri: string

  @IsString()
  public parserClass: keyof typeof TAL_PARSING_CLASSES

  @IsOptional()
  @IsNumber()
  public updateCycle?: number
}

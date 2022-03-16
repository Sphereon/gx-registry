import { IsString } from 'class-validator'

export class RequestTrustAnchorDto {
  @IsString()
  public publicKey: string
}

export class CreateTrustAnchorDto {
  @IsString()
  public name: string

  @IsString()
  public _list: string

  @IsString()
  public publicKey: string
}

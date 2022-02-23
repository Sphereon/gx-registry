import { IsString } from 'class-validator'

export class RequestTrustAnchorDto {
  @IsString()
  public publicKey: string
}

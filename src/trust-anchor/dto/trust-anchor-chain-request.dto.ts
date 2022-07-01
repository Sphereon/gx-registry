import { ApiProperty } from '@nestjs/swagger'

export class TrustAnchorChainRequestDto {
  @ApiProperty({
    description: 'The raw certificate chain in pem format'
  })
  readonly certs: string
}

export class CertificateChainDto {
  public certs: string[]
}

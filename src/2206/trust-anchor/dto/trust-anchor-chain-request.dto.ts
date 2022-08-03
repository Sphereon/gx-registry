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

export class TrustAnchorChainUriRequestDto {
  @ApiProperty({
    description: 'The uri to the file containing the certificate chain. PEM or PKCS7 format are expected.'
  })
  readonly uri: string
}

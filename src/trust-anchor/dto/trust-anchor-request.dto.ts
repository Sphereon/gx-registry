import { ApiProperty } from '@nestjs/swagger'

export class TrustAnchorRequestDto {
  @ApiProperty({
    description: 'The raw certificate in pem format'
  })
  readonly certificate: string
}

export class TrustAnchorRequestDtoV1 {
  @ApiProperty({
    description: 'The raw certificate in pem format'
  })
  readonly publicKey: string
}

import { Body, ConflictException, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiConflictResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger'
import { TrustAnchorApiResponse } from './decorators'
import { CertificateChainDto, TrustAnchorChainRequestDto, TrustAnchorChainUriRequestDto, TrustAnchorRequestDto } from './dto'
import { CertChainTransformPipe } from './pipes/transform-cert-chain.pipe'
import { TrustAnchorService } from './services'
import { trustAnchorV2Request, certificateChainRequest, certificateChainUriRequest } from '../tests/fixtures/certificates.json'
import { CertChainUriTransformPipe } from './pipes'

@ApiTags('TrustAnchor')
@Controller({ path: 'trustAnchor', version: '2204' })
export class TrustAnchorController {
  constructor(private readonly trustAnchorService: TrustAnchorService) {}
  @Post()
  @TrustAnchorApiResponse('Search for a TrustAnchor certificate in the registry', TrustAnchorRequestDto, {
    trustAnchor: { summary: 'Example Certificate', value: trustAnchorV2Request }
  })
  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({ description: `TrustAnchor was not be found in the registry` })
  async findTrustAnchor(@Body() trustAnchorRequestDto: TrustAnchorRequestDto) {
    const trustAnchorResponse = this.trustAnchorService.findTrustAnchor(trustAnchorRequestDto)

    return trustAnchorResponse
  }

  @Post('chain')
  @TrustAnchorApiResponse('Verify root of a certificate chain to be a TrustAnchor in the registry', TrustAnchorChainRequestDto, {
    certChain: { summary: 'Example Certificate Chain', value: certificateChainRequest }
  })
  @ApiConflictResponse({ description: `Root for the certificate chain could not be verified as a TrustAnchor in the registry` })
  async verifyTrustAnchorChainRaw(@Body(CertChainTransformPipe) certificateChainRaw: CertificateChainDto) {
    return this.validateCertificateChain(certificateChainRaw.certs)
  }

  @Post('chain/file')
  @TrustAnchorApiResponse(
    'Verify root of a certificate chain, provided as a file at uri, to be a TrustAnchor in the registry',
    TrustAnchorChainUriRequestDto,
    {
      certChain: { summary: 'Example Certificate Chain', value: certificateChainUriRequest }
    }
  )
  @ApiConflictResponse({ description: `Root for the certificate chain could not be verified as a TrustAnchor in the registry` })
  async verifyTrustAnchorChain(@Body(CertChainUriTransformPipe) certificateChainRaw: CertificateChainDto) {
    return this.validateCertificateChain(certificateChainRaw.certs)
  }

  async validateCertificateChain(certificates: string[]) {
    const verificationResult = await this.trustAnchorService.validateCertChain(certificates)

    const { result } = verificationResult

    if (!result) throw new ConflictException(verificationResult)

    return { result }
  }
}

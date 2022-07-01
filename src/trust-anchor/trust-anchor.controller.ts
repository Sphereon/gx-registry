import { Body, Controller, Post, Res } from '@nestjs/common'
import { ApiConflictResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { TrustAnchorApiResponse } from './decorators'
import { CertificateChainDto, TrustAnchorChainRequestDto, TrustAnchorRequestDto } from './dto'
import { CertChainTransformPipe } from './pipes/transform-cert-chain.pipe'
import { TrustAnchorService } from './services'
import { trustAnchorV2Request, certificateChainRequest } from '../tests/fixtures/certificates.json'

@ApiTags('TrustAnchor')
@Controller({ path: 'trustAnchor', version: '2' })
export class TrustAnchorController {
  constructor(private readonly trustAnchorService: TrustAnchorService) {}
  @Post()
  @TrustAnchorApiResponse('Search for a TrustAnchor certificate in the registry', TrustAnchorRequestDto, {
    trustAnchor: { summary: 'Example Certificate', value: trustAnchorV2Request }
  })
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
  async verifyTrustAnchorChain(@Body(CertChainTransformPipe) certificateChainRaw: CertificateChainDto, @Res() res: Response) {
    const verificationResult = await this.trustAnchorService.validateCertChain(certificateChainRaw.certs)

    const { result } = verificationResult

    const response = result ? { result } : verificationResult

    res.status(result ? 200 : 409).send(response)
  }
}

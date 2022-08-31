import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { ApiConflictResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { TrustAnchorApiResponse } from './decorators'
import { CertificateChainDto, TrustAnchorChainRequestDto, TrustAnchorRequestDtoV1 } from './dto'
import { CertChainTransformPipe } from './pipes'
import { TrustAnchorService } from './services'
import { trustAnchorV1Request, certificateChainRequest } from '../tests/fixtures/certificates.json'

//TODO: resolve code duplication for controller v1 & v2
@ApiTags('TrustAnchor')
@Controller({ path: 'trustAnchor' })
export class TrustAnchorControllerV1 {
  constructor(private readonly trustAnchorService: TrustAnchorService) {}
  @Post()
  @TrustAnchorApiResponse('Search for a TrustAnchor certificate in the registry', TrustAnchorRequestDtoV1, {
    certificate: { summary: 'Example Certificate', value: trustAnchorV1Request }
  })
  @ApiNotFoundResponse({ description: `TrustAnchor was not be found in the registry` })
  @HttpCode(HttpStatus.OK)
  async findTrustAnchor(@Body() trustAnchorRequestDto: TrustAnchorRequestDtoV1) {
    const trustAnchorResponse = this.trustAnchorService.findTrustAnchor({ certificate: trustAnchorRequestDto.publicKey })

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

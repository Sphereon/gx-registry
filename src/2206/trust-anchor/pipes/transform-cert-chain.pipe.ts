import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common'
import { stripPEMInfo } from '../../common/util'
import { CertificateChainDto, TrustAnchorChainRequestDto } from '../dto/trust-anchor-chain-request.dto'

@Injectable()
export class CertChainTransformPipe implements PipeTransform<TrustAnchorChainRequestDto, Promise<CertificateChainDto>> {
  private readonly logger = new Logger(CertChainTransformPipe.name)

  async transform(body: TrustAnchorChainRequestDto): Promise<CertificateChainDto> {
    try {
      const { certs } = body
      // split string into 1 item per certificate
      const split = certs.split('-----BEGIN CERTIFICATE-----')

      // remove BEGIN CERTIFICATE etc. and filter empty leftover strings
      const raw = split.map(c => stripPEMInfo(c)).filter(c => c.length > 1)

      return {
        certs: raw
      }
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException('Certificate chain could not be transformed.')
    }
  }
}

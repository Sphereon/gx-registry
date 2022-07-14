import { HttpService } from '@nestjs/axios'
import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common'
import { stripPEMInfo } from '../../common/util'
import { CertificateChainDto, TrustAnchorChainRequestDto, TrustAnchorChainUriRequestDto } from '../dto/trust-anchor-chain-request.dto'
import { CertChainTransformPipe } from './transform-cert-chain.pipe'

@Injectable()
export class CertChainUriTransformPipe implements PipeTransform<TrustAnchorChainUriRequestDto, Promise<CertificateChainDto>> {
  constructor(private readonly httpService: HttpService, private readonly chainTransformPipe: CertChainTransformPipe) {}

  private readonly logger = new Logger(CertChainUriTransformPipe.name)

  async transform(body: TrustAnchorChainUriRequestDto): Promise<CertificateChainDto> {
    const { uri } = body
    let res

    try {
      res = await this.httpService.get(uri).toPromise()
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException('File containing certificate chain could not be loaded.')
    }

    if (typeof res?.data !== 'string') throw new BadRequestException(`File at uri ${uri} does not contain valid data.`)
    return this.chainTransformPipe.transform({ certs: res.data })
  }
}

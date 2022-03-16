import { ValidationResult } from 'joi'
import { TTrustAnchorRequest } from '../dtos/trustAnchor.dto'
import { HttpException } from '../exceptions/HttpException'
import { ITrustAnchor, ITrustAnchorResponse, TrustStates } from '../interfaces/trustAnchor.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'
import { isEmpty } from '../utils/util'

class SampleService {
  public trustAnchor = TrustAnchor
  public trustAnchorList = TrustAnchorList

  public async findTrustAnchor(trustAnchorData: ValidationResult<TTrustAnchorRequest>['value']): Promise<ITrustAnchorResponse> {
    if (isEmpty(trustAnchorData)) throw new HttpException(400, 'Request body invalid.')

    const findTrustAnchor: ITrustAnchor = await this.trustAnchor.findOne({ publicKey: trustAnchorData.publicKey })

    if (!findTrustAnchor) throw new HttpException(409, 'Trust Anchor not found.')

    const response = await this.prepareTrustAnchorResponse(findTrustAnchor)

    return response
  }

  private async prepareTrustAnchorResponse(trustAnchor: ITrustAnchor): Promise<ITrustAnchorResponse> {
    const trustAnchorResponse: ITrustAnchorResponse = {
      trustState: TrustStates.Trusted,
      trustedForAttributes: new RegExp('.*', 'gm').toString(),
      trustedAt: trustAnchor.lastTimeOfTrust?.getTime()
    }

    return trustAnchorResponse
  }
}

export default SampleService

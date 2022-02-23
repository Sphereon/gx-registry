import { RequestTrustAnchorDto } from 'dtos/trustAnchor.dto'
import { HttpException } from '../exceptions/HttpException'
import { ITrustAnchor, ITrustAnchorList, ITrustAnchorResponse } from '../interfaces/trustAnchor.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'
import { isEmpty } from '../utils/util'

class SampleService {
  public trustAnchor = TrustAnchor
  public trustAnchorList = TrustAnchorList

  public async findTrustAnchor(trustAnchorData: RequestTrustAnchorDto): Promise<ITrustAnchorResponse> {
    if (isEmpty(trustAnchorData)) throw new HttpException(400, 'Request body invalid.')

    const findTrustAnchor: ITrustAnchor = await this.trustAnchor.findOne({ publicKey: trustAnchorData.publicKey })

    if (!findTrustAnchor) throw new HttpException(409, 'Trust Anchor not found.')

    const response = await this.prepareTrustAnchorResponse(findTrustAnchor)

    return response
  }

  private async prepareTrustAnchorResponse(trustAnchor: ITrustAnchor): Promise<ITrustAnchorResponse> {
    const findTrustAnchorList: ITrustAnchorList = await this.trustAnchorList.findById(trustAnchor.list_id)

    const lastUpdate = trustAnchor.updatedAt.getTime()

    const trustAnchorResponse: ITrustAnchorResponse = {
      trusted: true,
      attributes: {
        name: trustAnchor.name,
        trustAnchorLocation: findTrustAnchorList
          ? {
              name: findTrustAnchorList.name,
              location: findTrustAnchorList.location
            }
          : undefined,
        updatedAt: lastUpdate
      },
      timeOfTrust: lastUpdate
    }

    return trustAnchorResponse
  }
}

export default SampleService

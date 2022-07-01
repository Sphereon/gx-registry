import { TrustStates } from '../../common/interfaces/trustAnchor.interface'

export class TrustAnchorResponseDto {
  public trustState: TrustStates
  public trustedForAttributes?: string
  public trustedAt?: number
}

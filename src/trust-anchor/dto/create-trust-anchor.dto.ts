import { TrustAnchorList } from '../schemas/trust-anchor-list.schema'

export class CreateTrustAnchorDto {
  readonly name: string
  readonly _list: TrustAnchorList
  readonly certificate: string
}

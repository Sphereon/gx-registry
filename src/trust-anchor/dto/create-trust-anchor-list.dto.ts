import { TrustAnchorListParserType } from '../../common/interfaces/trustAnchor.interface'

export class CreateTrustAnchorListDto {
  readonly name: string
  readonly uri: string
  readonly parserClass: TrustAnchorListParserType
}

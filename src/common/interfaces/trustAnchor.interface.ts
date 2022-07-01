import { EiDASTrustedListParserService, MozillaCAListParserService } from '../../trust-anchor/services'

export const TAL_PARSING_CLASSES = {
  eiDASParser: EiDASTrustedListParserService,
  mozillaParser: MozillaCAListParserService
}

export type TrustAnchorListParserType = keyof typeof TAL_PARSING_CLASSES

// states will be extended in the future
export enum TrustStates {
  Trusted = 'trusted',
  Untrusted = 'untrusted'
}

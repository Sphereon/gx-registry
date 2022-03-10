import EiDASTrustedListParser from '../utils/parsers/EiDASTrustedListParser'

export const TAL_PARSING_CLASSES = {
  eiDASParser: EiDASTrustedListParser
}

// states will be extended in the future
export type TTrustStates = 'trusted' | 'untrusted'

export interface ITrustAnchor {
  _id: string
  name: string
  _list: string
  uri: string
  publicKey: string
  trustState: TTrustStates
  createdAt: Date
  updatedAt: Date
  lastTimeOfTrust?: Date
}

export interface ITrustAnchorList {
  _id: string
  name: string
  uri: string
  updateCycle: number
  parserClass: keyof typeof TAL_PARSING_CLASSES
  createdAt: Date
  updatedAt: Date
  lastFetchDate?: Date
}

export interface ITrustAnchorResponse {
  trustState: TTrustStates
  trustedForAttributes?: string
  trustedAt?: number
}

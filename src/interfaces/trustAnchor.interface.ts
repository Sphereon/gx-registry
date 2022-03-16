import EiDASTrustedListParser from '../utils/parsers/EiDASTrustedListParser'

export const TAL_PARSING_CLASSES = {
  eiDASParser: EiDASTrustedListParser
}

// states will be extended in the future
export enum TrustStates {
  Trusted = 'trusted',
  Untrusted = 'untrusted'
}

export interface ICreateTrustAnchor {
  name: string
  _list: string
  uri?: string
  publicKey: string
}

export interface ITrustAnchor extends ICreateTrustAnchor {
  _id: string
  createdAt: Date
  updatedAt: Date
  trustState?: TrustStates
  lastTimeOfTrust?: Date
}

export interface ICreateTrustAnchorList {
  name: string
  uri: string
  parserClass: keyof typeof TAL_PARSING_CLASSES
  updateCycle?: number
}

export interface ITrustAnchorList extends ICreateTrustAnchorList {
  _id: string
  createdAt: Date
  updatedAt: Date
  lastFetchDate?: Date
}

export interface ITrustAnchorResponse {
  trustState: TrustStates
  trustedForAttributes?: string
  trustedAt?: number
}

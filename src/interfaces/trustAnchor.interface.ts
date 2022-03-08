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
  location: string
  updateCycle: number
  createdAt: Date
  updatedAt: Date
}

export interface ITrustAnchorResponse {
  trustState: TTrustStates
  trustedForAttributes?: string
  trustedAt?: number
}

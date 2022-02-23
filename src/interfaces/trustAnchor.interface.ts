export interface ITrustAnchor {
  _id: string
  name: string
  list_id: string
  publicKey: string
  updatedAt: Date
}

export interface ITrustAnchorList {
  _id: string
  name: string
  location: string
  type: 'CSV' | 'XML'
  updateCycle: number
  updatedAt: Date
}

export interface ITrustAnchorResponse {
  trusted: boolean
  attributes?: {
    name: string
    updatedAt: number
    trustAnchorLocation: {
      name: string
      location: string
    }
  }
  timeOfTrust?: number
}

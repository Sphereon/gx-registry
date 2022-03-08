import { Document, model, Types, Schema } from 'mongoose'

import { ITrustAnchor } from '../interfaces/trustAnchor.interface'

const trustAnchorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    _list: {
      type: Types.ObjectId,
      required: true
    },
    uri: {
      type: String,
      required: true,
      trim: true
    },
    publicKey: {
      type: String,
      required: true,
      trim: true
    },
    trustState: {
      type: String,
      required: true
    },
    lastTimeOfTrust: Date
  },
  {
    timestamps: true
  }
)

const TrustAnchor = model<ITrustAnchor & Document>('TrustAnchor', trustAnchorSchema)

export default TrustAnchor

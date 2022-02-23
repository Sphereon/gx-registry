import { Document, model, Types, Schema } from 'mongoose'

import { ITrustAnchor } from '../interfaces/trustAnchor.interface'

const trustAnchorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    list_id: {
      type: Types.ObjectId,
      required: true
    },
    publicKey: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

const TrustAnchor = model<ITrustAnchor & Document>('TrustAnchor', trustAnchorSchema)

export default TrustAnchor

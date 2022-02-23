import { Document, model, Schema } from 'mongoose'

import { ITrustAnchorList } from '../interfaces/trustAnchor.interface'

const trustAnchorListSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['XML', 'CSV'],
      required: true
    },
    updateCycle: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const TrustAnchorList = model<ITrustAnchorList & Document>('TrustAnchorList', trustAnchorListSchema)

export default TrustAnchorList

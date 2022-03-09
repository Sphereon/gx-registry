import { Document, model, Schema } from 'mongoose'

import { ITrustAnchorList } from '../interfaces/trustAnchor.interface'

const trustAnchorListSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    uri: {
      type: String,
      required: true,
      trim: true
    },
    updateCycle: {
      type: Number,
      required: false
    },
    parserClass: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const TrustAnchorList = model<ITrustAnchorList & Document>('TrustAnchorList', trustAnchorListSchema)

export default TrustAnchorList

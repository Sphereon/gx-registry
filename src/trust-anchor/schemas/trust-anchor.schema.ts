import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { TrustAnchorList } from './trust-anchor-list.schema'

export type TrustAnchorDocument = TrustAnchor & Document

@Schema({
  timestamps: true
})
export class TrustAnchor {
  @Prop({
    required: true,
    trim: true
  })
  public name: string

  @Prop({ type: Types.ObjectId, ref: 'TrustAnchorList', required: true })
  public _list: TrustAnchorList

  @Prop({
    required: true,
    trim: true
  })
  public certificate: string

  @Prop({
    trim: true
  })
  public uri?: string

  //TODO: this should be required
  @Prop()
  public trustState?: string

  @Prop()
  public lastTimeOfTrust?: Date
}

export const TrustAnchorSchema = SchemaFactory.createForClass(TrustAnchor)
// Make sure there are no duplicates (each ertificate once per list)
TrustAnchorSchema.index({ certificate: 1, _list: 1 }, { unique: true })

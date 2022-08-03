import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { TrustAnchorListParserType } from '../../common/interfaces/trustAnchor.interface'

export type TrustAnchorListDocument = TrustAnchorList & Document

@Schema({ timestamps: true })
export class TrustAnchorList {
  @Prop({ required: true, trim: true })
  public name: string

  @Prop({ required: true, trim: true })
  public uri: string

  @Prop({ required: true, type: String })
  public parserClass: TrustAnchorListParserType

  @Prop()
  public updateCycle?: number

  @Prop()
  public lastFetchDate?: Date
}

export const TrustAnchorListSchema = SchemaFactory.createForClass(TrustAnchorList)

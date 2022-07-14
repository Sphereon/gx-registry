import { HttpModule } from '@nestjs/axios'
import { CacheModule, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CertChainTransformPipe } from './pipes'
import { TrustAnchor, TrustAnchorList, TrustAnchorListSchema, TrustAnchorSchema } from './schemas'
import { EiDASTrustedListParserService, MozillaCAListParserService, TrustAnchorListService, TrustAnchorService } from './services'
import { TrustAnchorController } from './trust-anchor.controller'

@Module({
  imports: [
    HttpModule,
    CacheModule.register(),
    MongooseModule.forFeature([{ name: TrustAnchor.name, schema: TrustAnchorSchema }]),
    MongooseModule.forFeature([{ name: TrustAnchorList.name, schema: TrustAnchorListSchema }])
  ],
  controllers: [TrustAnchorController],
  providers: [EiDASTrustedListParserService, MozillaCAListParserService, TrustAnchorService, TrustAnchorListService, CertChainTransformPipe]
})
export class TrustAnchorModule {}

import { HttpModule } from '@nestjs/axios'
import { CacheModule, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TrustAnchor, TrustAnchorList, TrustAnchorListSchema, TrustAnchorSchema } from './schemas'
import { EiDASTrustedListParserService, MozillaCAListParserService, TrustAnchorListService, TrustAnchorService } from './services'
import { TrustAnchorControllerV1 } from './trust-anchor-v1.controller'

@Module({
  imports: [
    HttpModule,
    CacheModule.register(),
    MongooseModule.forFeature([{ name: TrustAnchor.name, schema: TrustAnchorSchema }]),
    MongooseModule.forFeature([{ name: TrustAnchorList.name, schema: TrustAnchorListSchema }])
  ],
  controllers: [TrustAnchorControllerV1],
  providers: [EiDASTrustedListParserService, MozillaCAListParserService, TrustAnchorService, TrustAnchorListService]
})
export class TrustAnchorModuleV1 {}

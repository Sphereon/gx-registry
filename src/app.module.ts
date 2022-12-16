import { join } from 'path'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TrustAnchorModule } from './trust-anchor/trust-anchor.module'
import { MongooseModule } from '@nestjs/mongoose'
import { TermsAndConditionsModule } from './terms-and-conditions/terms-and-conditions.module'
import { ShapeModule2206 } from './shape/shape.module'
import { ComplianceIssuersModule } from './compliance-issuers/compliance-issuers.module'
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src/static'),
      exclude: ['/api*']
    }),
    MongooseModule.forRoot(
      `${process.env.MONGO_URI}${process.env.MONGO_DATABASE? '/' + process.env.MONGO_DATABASE: ''}`
    ),
    TrustAnchorModule,
    TermsAndConditionsModule,
    ShapeModule2206,
    ComplianceIssuersModule
  ],
  controllers: [AppController]
})
export class AppModule {}

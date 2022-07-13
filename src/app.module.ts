import { join } from 'path'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TrustAnchorModule } from './trust-anchor/trust-anchor.module'
import { MongooseModule } from '@nestjs/mongoose'
import { TrustAnchorModuleV1 } from './trust-anchor/trust-anchor-v1.module'
import { TermsAndConditionsModule } from './terms-and-conditions/terms-and-conditions.module'
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
    MongooseModule.forRoot(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`),
    TrustAnchorModule,
    TrustAnchorModuleV1,
    TermsAndConditionsModule
  ],
  controllers: [AppController]
})
export class AppModule {}

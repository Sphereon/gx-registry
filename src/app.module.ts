import { join } from 'path'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TrustAnchorModule } from './trust-anchor/trust-anchor.module'
import { MongooseModule } from '@nestjs/mongoose'
import { TrustAnchorModuleV1 } from './trust-anchor/trust-anchor-v1.module'

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
    MongooseModule.forRoot('mongodb://127.0.0.1:27017'),
    TrustAnchorModule,
    TrustAnchorModuleV1
  ],
  controllers: [AppController]
})
export class AppModule {}

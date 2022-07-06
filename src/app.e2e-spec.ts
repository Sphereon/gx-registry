import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from './app.module'

describe('AppController (e2e)', () => {
  //TODO: enable tests
  // let app: INestApplication
  // beforeEach(async () => {
  //   const moduleFixture: TestingModule = await Test.createTestingModule({
  //     imports: [AppModule]
  //   }).compile()
  //   app = moduleFixture.createNestApplication()
  //   await app.init()
  // })
  it.skip('/ (GET)', () => {
    return true // request(app.getHttpServer()).get('/').expect(200).expect('Content-Type', /json/)
  })
})

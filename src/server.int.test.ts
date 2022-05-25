import supertest from 'supertest'
import App, { SWAGGER_UI_PATH } from './app'
import { ITrustAnchorResponse, TCreateTrustAnchor, TCreateTrustAnchorList, TrustStates } from './interfaces/trustAnchor.interface'
import routes from './routes'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import TrustAnchorList from './models/trustAnchorList.model'
import TrustAnchor from './models/trustAnchor.model'
import TrustAnchorListService from './services/trustAnchorList.service'
import { logger } from './utils/logger'

logger.silent = true

const app = new App(routes)

const server = app.getServer()

const validPublicKey = 'anchor-12345'

describe('server', () => {
  // mock initial TrustAnchorList fetching
  jest.spyOn(TrustAnchorListService.prototype, 'fetchAllTrustAnchorLists').mockImplementationOnce(async () => {
    const createTrustAnchorListMock: TCreateTrustAnchorList = {
      name: 'Test List',
      uri: 'https://delta-dao.com',
      parserClass: 'eiDASParser'
    }

    const tal = await TrustAnchorList.create(createTrustAnchorListMock)
    const lastTimeOfTrustDate = new Date()
    const createTrustAnchorMock: TCreateTrustAnchor = {
      name: 'Test Anchor',
      _list: tal._id,
      publicKey: validPublicKey,
      lastTimeOfTrust: lastTimeOfTrustDate
    }

    await TrustAnchor.create(createTrustAnchorMock)

    return 1
  })

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()

    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  it('should run and return descriptive json', async () => {
    // call here, since app.listen() is not called during testing
    await app.initializeTrustAnchors()

    return supertest(server)
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(response => {
        expect(response.body).toEqual(
          expect.objectContaining({
            software: expect.any(String),
            description: expect.any(String),
            version: expect.any(String)
          })
        )
      })
  })

  describe('Swagger UI', () => {
    it(`should redirect to the swagger UI at ${SWAGGER_UI_PATH}`, () => {
      return supertest(server).get(`${SWAGGER_UI_PATH}`).expect(301).expect('location', `${SWAGGER_UI_PATH}/`)
    })

    it(`should return the swagger UI at ${SWAGGER_UI_PATH}/`, () => {
      return supertest(server).get(`${SWAGGER_UI_PATH}/`).expect(200)
    })
  })

  describe('API endpoints', () => {
    describe('POST /api/trustAnchor route', () => {
      describe('given an invalid request', () => {
        it('should return a 400 status code', () => {
          return supertest(server).post('/api/trustAnchor').send({ pk: validPublicKey }).expect(400)
        })
      })

      describe('given a trsutAnchor for the given publicKey does not exist', () => {
        it('should return a 404 status code', () => {
          return supertest(server)
            .post('/api/trustAnchor')
            .send({ publicKey: validPublicKey.substring(1) })
            .expect(404)
        })
      })

      describe('given a trustAnchor for the given publicKey exists', () => {
        it('should return a 200 status code and a valid TrustAnchorResponse', () => {
          const trustStates = Object.values(TrustStates)

          return supertest(server)
            .post('/api/trustAnchor')
            .send({ publicKey: validPublicKey })
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
              expect(response.body).toEqual(
                expect.objectContaining({
                  trustState: expect.stringMatching(`(${trustStates.join('|')})`),
                  trustedForAttributes: expect.any(String),
                  trustedAt: expect.any(Number)
                } as ITrustAnchorResponse)
              )
            })
        })
      })
    })
  })
})

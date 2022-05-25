process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import config from 'config'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import mongoose from 'mongoose'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { dbConnection } from './databases'
import { Routes } from './interfaces/routes.interface'
import errorMiddleware from './middlewares/error.middleware'
import { logger, stream } from './utils/logger'
import { version, name, description } from '../package.json'
import TrustAnchorListService from './services/trustAnchorList.service'
import path from 'path'

export const SWAGGER_UI_PATH = '/docs'
class App {
  public app: express.Application
  public port: string | number
  public env: string

  constructor(routes: Routes[]) {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.env = process.env.NODE_ENV || 'development'

    this.initializeMiddlewares()
    this.initializeRoutes(routes)
    this.initializeSwagger()
    this.initializeErrorHandling()
  }

  public listen() {
    this.app.listen(this.port, async () => {
      logger.info(`=================================`)
      logger.info(`======= ENV: ${this.env} =======`)
      logger.info(`🚀 App listening on the port ${this.port}`)
      logger.info(`=================================`)
      await this.connectToDatabase()
      this.initializeTrustAnchors()
    })
  }

  public getServer() {
    return this.app
  }

  private async connectToDatabase() {
    if (this.env !== 'production') {
      mongoose.set('debug', true)
    }
    try {
      logger.info(`[Mongoose] trying to connect at ${dbConnection.url} with:`)
      await mongoose.connect(dbConnection.url)
      logger.info(`[Mongoose] connected to mongodb at ${dbConnection.url}:`, mongoose.connection)
      logger.log('debug', `[Mongoose] connected to mongodb at ${dbConnection.url}`)
      this.app.emit('mongoSetupFinished')
    } catch (err) {
      logger.error(`[Mongoose] connection error: ${err.message}`)
      this.app.emit('mongoSetupFailed')
    }
  }

  private prepareCorsOptions(): CorsOptions {
    let originConfig: CorsOptions['origin'] = config.get('cors.origin')

    if (originConfig.constructor === Array) {
      originConfig = (originConfig as string[]).map(origin => new RegExp(origin))
    } else {
      originConfig = new RegExp(originConfig as string)
    }

    const options = {
      origin: originConfig,
      credentials: config.get('cors.credentials') as CorsOptions['credentials']
    }

    logger.info(`[CORS] prepared the following CORS options from config:`)
    logger.info(options)

    return options
  }

  private initializeMiddlewares() {
    this.app.use(morgan(config.get('log.format'), { stream }))
    this.app.use(cors(this.prepareCorsOptions()))
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
    this.app.use(express.static(path.join(__dirname, './static')))
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router)
    })
  }

  private initializeSwagger() {
    const options: swaggerJSDoc.OAS3Options = {
      definition: {
        openapi: '3.0.3',
        info: {
          title: name,
          description: description,
          version: version,
          license: {
            name: 'Apache 2.0',
            url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
          }
        }
      },
      // TODO: decide on what style to use (docs in routes vs. dedicated .yml file)
      // apis: ['./routes/routes*.js']
      apis: ['swagger.yml']
    }

    const specs = swaggerJSDoc(options)

    this.app.use(SWAGGER_UI_PATH, swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware)
  }

  public async initializeTrustAnchors() {
    const talService = new TrustAnchorListService()

    const updated = await talService.fetchAllTrustAnchorLists()

    logger.info(`[TrustAnchors] Fetched from ${talService.parentLists.length} parent lists and updated ${updated} trust anchors.`)
  }
}

export default App

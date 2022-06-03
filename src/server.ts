process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'dotenv/config'
import App from './app'
import routes from './routes'
import validateEnv from './utils/validateEnv'

validateEnv()

const app = new App(routes)

app.listen()

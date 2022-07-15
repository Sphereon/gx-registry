import fs from 'fs'
import { join } from 'path'

export const availableShapeFiles = fs.readdirSync(join(__dirname, '../static/shapes/v1')).map(filename => filename.split('.')[0])

export enum FileTypes {
  ttl,
  jsonld
}

import { join } from 'path'
import replaceInFile from 'replace-in-file'

const options = {
  files: join(__dirname, '../..', `static/shapes/v2210/**/*`),
  from: /{{BASE_URI}}/g,
  to: `${process.env.BASE_URI}${process.env.BASE_SHAPE_PATH}`
}

// replace {{BASE_URI}} placeholder in .ttl files and context.json in dist folder
export function replaceShapeContextBaseUri() {
  replaceInFile.sync(options)
}

import { availableShapeFiles } from '../constants'
import { Injectable, InternalServerErrorException, Logger, StreamableFile } from '@nestjs/common'
import { join } from 'path'
import { Readable } from 'stream'
import { createReadStream } from 'fs'
import * as ttl2jsonld from '@frogcat/ttl2jsonld'
import { FileTypes } from '../constants'
@Injectable()
export class ShapeService2206 {
  private readonly logger = new Logger('Shape')

  async getFileByType(file: string, type: FileTypes): Promise<StreamableFile> {
    const ttlFile = this.getTtlFile(file)
    let fileStream = ttlFile

    if (String(type) === 'jsonld') {
      const ttlAsString = await this.streamToString(ttlFile)
      const jsonld = this.convertToJsonld(ttlAsString)
      fileStream = this.getReadable(JSON.stringify(jsonld))
    }

    return new StreamableFile(fileStream)
  }

  async getJsonldContext(version): Promise<any> {
    const context = {
      '@version': version
    }

    const shapeFiles = await this.getAvailableShapeFiles()
    for (const file of shapeFiles) {
      const ttlFile = await this.getTtlFile(file)
      const ttlAsString = await this.streamToString(ttlFile)
      const jsonld = this.convertToJsonld(ttlAsString)
      context[`gx-${file}`] = jsonld
    }

    return context
  }

  async getAvailableShapeFiles(): Promise<Array<string>> {
    return availableShapeFiles
  }

  private getTtlFile(filename, version = 2206): any {
    try {
      const file = createReadStream(join(__dirname, `../../../static/shapes/v${version}/${filename}.ttl`))
      return file
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  private convertToJsonld(ttl: string): any {
    const jsonld = ttl2jsonld.parse(ttl)

    return jsonld
  }

  private getReadable(input: string) {
    const readable = Readable.from(input)

    return readable
  }

  private streamToString(stream): Promise<string> {
    const chunks = []
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
      stream.on('error', err => reject(err))
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
  }
}

import { Injectable, Logger } from '@nestjs/common'
import { termsAndConditions } from '../constants'
import { BadRequestException } from '@nestjs/common'

@Injectable()
export class TermsAndConditionsService {
  private readonly logger = new Logger('TermsAndConditions')

  getTermsAndConditionsByVersion(version: string): string {
    const selectedTermsAndConditions = termsAndConditions[version]
    if (!selectedTermsAndConditions)
      throw new BadRequestException(`Specified version ${version} does not exist. Available versions: ${this.getAvailableTermsAndConditions()}`)

    return selectedTermsAndConditions
  }

  getAvailableTermsAndConditions(): Array<string> {
    const availableVersions = Object.keys(termsAndConditions)

    return availableVersions
  }
}

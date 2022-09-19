import { Injectable } from '@nestjs/common'
import { VALID_COMPLIANCE_ISSUER } from './constants'

@Injectable()
export class ComplianceIssuersService {
  findAll(): string[] {
    return VALID_COMPLIANCE_ISSUER
  }
}

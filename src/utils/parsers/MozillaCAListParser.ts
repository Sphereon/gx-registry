import { CreateTrustAnchorDto } from '../../dtos/trustAnchor.dto'
import TrustAnchorListParser from './TrustAnchorListParser'

/**
 * https://wiki.mozilla.org/CA/Included_Certificates
 * The Mozilla CA Certificate Program's list of included root certificates
 * is stored in a file called certdata.txt in the Mozilla source code management system.
 * We are utilizing the IncludedCACertificateWithPEMReport.csv which includes
 * raw PEM data about the certificates of CAs int the "PEM Info" field.
 */
export default class MoziallaCAListParser extends TrustAnchorListParser {
  getTrustAnchors(): Promise<CreateTrustAnchorDto[]> {
    throw new Error('Method not implemented.')
  }
}

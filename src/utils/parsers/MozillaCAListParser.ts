import { CreateTrustAnchorDto } from '../../dtos/trustAnchor.dto'
import fetch from 'node-fetch'
import { parse } from 'csv-parse/sync'
import { IMozillaCAList, IMozillaCARecord, IMozillaCARecordUnfiltered } from '../../interfaces/mozilla.interface'
import TrustAnchorListParser from './TrustAnchorListParser'
import { logger } from '../logger'
import TrustAnchorList from '../../models/trustAnchorList.model'

/**
 * https://wiki.mozilla.org/CA/Included_Certificates
 * The Mozilla CA Certificate Program's list of included root certificates
 * is stored in a file called certdata.txt in the Mozilla source code management system.
 * We are utilizing the IncludedCACertificateWithPEMReport.csv which includes
 * raw PEM data about the certificates of CAs int the "PEM Info" field.
 */
export default class MozillaCAListParser extends TrustAnchorListParser {
  private static FILTER_FOR_COLUMNS: (string & keyof IMozillaCARecord)[] = [
    'CommonNameorCertificateName',
    'PEMInfo',
    'ValidFrom[GMT]',
    'ValidTo[GMT]'
  ]

  trustAnchorListObject: IMozillaCAList

  protected async getTrustAnchors(): Promise<CreateTrustAnchorDto[]> {
    // Initialize the array that should hold the returned trustAnchors
    const createTrustAnchorDtos: CreateTrustAnchorDto[] = []
    if (!this.shouldFetchNow()) return createTrustAnchorDtos

    try {
      // First get the csv file at the lists uri parsed into a js object
      if (!this.trustAnchorListObject) this.trustAnchorListObject = await MozillaCAListParser.getMozillaCAListObject(this.trustAnchorList.uri)
      const listObject = this.trustAnchorListObject

      // then map over all the records in the csv list,
      listObject.records.forEach(record =>
        // transforming each record in the correct TrustAnchor format
        // and add the TrustAnchor to the returned array
        createTrustAnchorDtos.push({
          name: record.CommonNameorCertificateName,
          publicKey: record.PEMInfo,
          _list: this.trustAnchorList._id
        })
      )
    } catch (error) {
      logger.error(error)
    } finally {
      // finally update the lastFetchDate of the list
      await TrustAnchorList.findByIdAndUpdate(this.trustAnchorList._id, { lastFetchDate: new Date() })
      // and return the TrustAnchors
      return createTrustAnchorDtos
    }
  }

  static async getMozillaCAListObject(uri: string): Promise<IMozillaCAList> {
    const response = await fetch(uri)

    const csvString = await response.text()
    const listObject: IMozillaCAList = {
      records: parse(csvString, {
        columns: MozillaCAListParser.transformCsvHeader,
        on_record: MozillaCAListParser.filterRecord
      })
    }

    return listObject
  }

  /**
   * Filters a given record to only include properties as defined in {@link MozillaCAListParser.FILTER_FOR_COLUMNS}
   * @param record an unfiltered record
   * @returns {IMozillaCARecord} the filtered record
   */
  static filterRecord(record: IMozillaCARecordUnfiltered): IMozillaCARecord {
    return Object.fromEntries(
      MozillaCAListParser.FILTER_FOR_COLUMNS.map(col => {
        const value = col === 'PEMInfo' ? MozillaCAListParser.stripPEMInfo(record[col]) : record[col]
        return [col, value]
      })
    ) as unknown as IMozillaCARecord
  }

  /**
   * Removes /-----(BEGIN|END) CERTIFICATE-----/ and any \n newlines from a given string to unify entries in the DB
   * @param PEMInfo the string (public key) to strip
   * @returns {IMozillaCARecord} the stripped publicKey
   */
  static stripPEMInfo(PEMInfo: string): string {
    return PEMInfo.replace(/([']*-----(BEGIN|END) CERTIFICATE-----[']*|\n)/gm, '')
  }

  static transformCsvHeader(header: string[]): string[] {
    return header.map(col => col.replace(/ /g, ''))
  }
}

import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { parse } from 'csv-parse/sync'
import { Model } from 'mongoose'
import { TrustAnchorListParser } from '..'
import { IMozillaCAList, IMozillaCARecord, IMozillaCARecordUnfiltered, TMozillaCARecordColumnModMap } from '../../../common/interfaces'
import { stripPEMInfo } from '../../../common/util'
import { TrustAnchor, TrustAnchorList, TrustAnchorListDocument } from '../../schemas'

enum MozillaCAListColumns {
  CommonName = 'CommonNameorCertificateName',
  PEMInfo = 'PEMInfo',
  ValidFrom = 'ValidFrom[GMT]',
  ValidTo = 'ValidTo[GMT]'
}

/**
 * https://wiki.mozilla.org/CA/Included_Certificates
 * The Mozilla CA Certificate Program's list of included root certificates
 * is stored in a file called certdata.txt in the Mozilla source code management system.
 * We are utilizing the IncludedCACertificateWithPEMReport.csv which includes
 * raw PEM data about the certificates of CAs int the "PEM Info" field.
 */
@Injectable()
export class MozillaCAListParserService implements TrustAnchorListParser {
  private readonly logger = new Logger(MozillaCAListParserService.name)

  // Enable typings & easy iteration in class
  private static FILTER_FOR_COLUMNS: (keyof IMozillaCARecord)[] = Object.values(MozillaCAListColumns)

  // Configure modifications of columns of a given record
  private static COLUMN_MOD_MAP: TMozillaCARecordColumnModMap = {
    // PEMInfo holds the X509 certificate
    [MozillaCAListColumns.PEMInfo]: stripPEMInfo
  }

  constructor(
    @InjectModel(TrustAnchorList.name) protected trustAnchorListModel: Model<TrustAnchorListDocument>,
    protected readonly httpService: HttpService
  ) {}

  public async getTrustAnchors(trustAnchorList: TrustAnchorListDocument): Promise<TrustAnchor[]> {
    this.logger.log(`Initiating getTrustAnchors for ${trustAnchorList.uri}`)
    // Initialize the array that should hold the returned trustAnchors
    const createTrustAnchorDtos: TrustAnchor[] = []
    try {
      // First get the csv file at the lists uri parsed into a js object
      const trustAnchorListObject = await this.getMozillaCAListObject(trustAnchorList.uri)

      // then map over all the records in the csv list,
      trustAnchorListObject.records.forEach(record =>
        // transforming each record in the correct TrustAnchor format
        // and add the TrustAnchor to the returned array
        createTrustAnchorDtos.push({
          name: record.CommonNameorCertificateName,
          certificate: record.PEMInfo,
          _list: trustAnchorList._id
        })
      )

      this.logger.debug(`Found ${createTrustAnchorDtos.length} TrustAnchors for ${trustAnchorList.uri}`)
    } catch (error) {
      this.logger.error(error)
    } finally {
      // finally update the lastFetchDate of the list
      await this.trustAnchorListModel.updateOne({ _id: trustAnchorList.id }, { lastFetchDate: new Date() }).exec()
      // and return the TrustAnchors
      return createTrustAnchorDtos
    }
  }

  async getMozillaCAListObject(uri: string): Promise<IMozillaCAList> {
    const response = await this.httpService.get(uri).toPromise()

    const csvString = response.data
    const listObject: IMozillaCAList = {
      records: parse(csvString, {
        columns: MozillaCAListParserService.transformCsvHeader,
        on_record: MozillaCAListParserService.filterRecordAndCleanupColumns
      })
    }

    return listObject
  }

  /**
   * Filters a given record to only include properties as defined in {@link MozillaCAListParserService.FILTER_FOR_COLUMNS}.
   * @param record an unfiltered record
   * @returns {IMozillaCARecord} the filtered record
   */
  static filterRecord(record: IMozillaCARecordUnfiltered): IMozillaCARecord {
    return Object.fromEntries(
      MozillaCAListParserService.FILTER_FOR_COLUMNS.map(column => {
        return [column, record[column]]
      })
    ) as unknown as IMozillaCARecord
  }

  /**
   * Function that handles any cleanup and modifications to prepare the columns of a given record for DB storage
   * @param {IMozillaCARecord} record the record to be modified
   * @returns {IMozillaCARecord} the modified record
   */
  static cleanupRecordColumns(record: IMozillaCARecord): IMozillaCARecord {
    // Use the static modification map to modify column values of the record
    Object.keys(record).forEach(column => {
      // COLUMN_MOD_MAP maps funtions modifying a given string to the record column keys
      // Use the mod map to adjust a value, or use the given value as fallback
      const modFn: (v: string) => string = MozillaCAListParserService.COLUMN_MOD_MAP[column]
      record[column] = modFn ? modFn(record[column]) : record[column]
    })

    return record
  }

  /**
   * Filter a given record (see {@link filterRecord}) and then cleanup its columns (see {@link cleanupRecordColumns})
   * @param {IMozillaCARecordUnfiltered} record to be filtered and cleaned
   * @returns {IMozillaCARecord} filtered and cleaned record
   */
  static filterRecordAndCleanupColumns(record: IMozillaCARecordUnfiltered): IMozillaCARecord {
    const filtered = MozillaCAListParserService.filterRecord(record)
    const cleaned = MozillaCAListParserService.cleanupRecordColumns(filtered)

    return cleaned
  }

  static transformCsvHeader(header: string[]): string[] {
    return header.map(col => col.replace(/ /g, ''))
  }
}

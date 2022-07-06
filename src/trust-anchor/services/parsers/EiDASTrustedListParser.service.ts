import { HttpService } from '@nestjs/axios'
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { XMLParser } from 'fast-xml-parser'
import { Model } from 'mongoose'
import { TrustAnchorListParser, TrustAnchorListService } from '..'
import { IDigitalId, IName, ITrustedList, ITSPService, ITSPServiceWithSPName } from '../../../common/interfaces'
import { getValueAsArray } from '../../../common/util'
import { DEFAULT_UPSERT_OPTIONS } from '../../constants'
import { CreateTrustAnchorListDto } from '../../dto'
import { TrustAnchor, TrustAnchorList, TrustAnchorListDocument } from '../../schemas'

/**
 * https://ec.europa.eu/tools/lotl/eu-lotl.xml
 * The eiDAS LOTL is a collection of trusted lists (TL)
 * The TLs are issued by the different member states
 * The locations (uris) of the different lists are located
 * in a respective "OtherTSLPointer" tag, which in turn are
 * collected inside the "PointersToOtherTSL" tag
 */
@Injectable()
export class EiDASTrustedListParserService implements TrustAnchorListParser {
  private readonly logger = new Logger(EiDASTrustedListParserService.name)

  private xmlParser = new XMLParser()

  constructor(
    @InjectModel(TrustAnchorList.name) protected trustAnchorListModel: Model<TrustAnchorListDocument>,
    @Inject(forwardRef(() => TrustAnchorListService)) private readonly trustAnchorListService: TrustAnchorListService,
    protected readonly httpService: HttpService
  ) {}

  public async getTrustAnchors(trustAnchorList: TrustAnchorListDocument): Promise<TrustAnchor[]> {
    // Initialize the array that should hold the returned trustAnchors
    let createTrustAnchorDtos: TrustAnchor[] = []
    this.logger.log(`Initiating getTrustAnchors for ${trustAnchorList.uri}`)
    try {
      this.logger.debug(`Getting TrustAnchors for ${trustAnchorList.uri}`)
      // First get the xml string at the lists uri parsed into a js object
      const trustAnchorListObject = await this.getTrustedListObject(trustAnchorList.uri)

      // Then we need to check if the list has any trust anchors itself
      const tspServices = await this.getTrustServiceProviderServicesFromTrustedList(trustAnchorListObject)
      // and add them to the returned array
      const trustAnchors = this.getCreateTrustAnchorDtosFromTSPServices(tspServices, trustAnchorList)
      createTrustAnchorDtos = createTrustAnchorDtos.concat(trustAnchors)
      this.logger.debug(`Found ${trustAnchors.length} TrustAnchors for ${trustAnchorList.uri}`)

      // once we have the trust anchors, we need to update the lastFetchDate for the DB entry
      // to prevent fetching the list again if it is found in any OtherTSLPointer
      // finally update the lastFetchDate of the list
      await this.trustAnchorListModel.updateOne({ _id: trustAnchorList.id }, { lastFetchDate: new Date() }).exec()

      // We also want to check for any pointers to other trusted lists
      const { PointersToOtherTSL } = trustAnchorListObject.TrustServiceStatusList.SchemeInformation
      const otherTSLPointers = getValueAsArray(PointersToOtherTSL.OtherTSLPointer)
      this.logger.debug(`Found ${otherTSLPointers.length} OtherTSLPointers in ${trustAnchorList.uri}`)

      // and if we find any
      for (const tslPointer of otherTSLPointers) {
        try {
          // find or create the respective ITrustAnchorList,
          const tslPointerListObject = await this.getTrustedListObject(tslPointer.TSLLocation)
          const createTalDto = await this.getCreateTrustAnchorListDto(tslPointer.TSLLocation, tslPointerListObject)

          const findTrustAnchorList = await this.trustAnchorListModel
            .findOneAndUpdate({ uri: createTalDto.uri }, createTalDto, DEFAULT_UPSERT_OPTIONS)
            .exec()

          // parse the list for TrustAnchors
          const tslPointerTrustAnchors = await this.trustAnchorListService.fetchTrustAnchors(findTrustAnchorList)

          // and add those TrustAnchors to the returned array
          createTrustAnchorDtos = createTrustAnchorDtos.concat(tslPointerTrustAnchors)
        } catch (error) {
          this.logger.error(error)
          continue
        }
      }
    } catch (error) {
      this.logger.error(error)
    } finally {
      // finally return the createTrustAnchorsDtos
      return createTrustAnchorDtos
    }
  }

  private getCreateTrustAnchorDtosFromTSPServices(services: ITSPServiceWithSPName[], trustAnchorList: TrustAnchorListDocument): TrustAnchor[] {
    const createTrustAnchorDtos: TrustAnchor[] = []
    for (const service of services) {
      const name = this.getTrustAnchorName(service.TSPName, service.ServiceInformation.ServiceName)
      const { DigitalId } = service.ServiceInformation.ServiceDigitalIdentity
      const certificate = this.findX509CredentialDigitalId(getValueAsArray(DigitalId)).X509Certificate

      const _list = trustAnchorList._id

      createTrustAnchorDtos.push({
        name,
        certificate,
        _list
      })
    }
    return createTrustAnchorDtos
  }

  filterForX509CertificateServices(services: ITSPService[]): ITSPService[] {
    const filteredServices = services.filter(service => {
      const { DigitalId } = service.ServiceInformation.ServiceDigitalIdentity
      return this.findX509CredentialDigitalId(getValueAsArray(DigitalId))
    })

    return filteredServices
  }

  async findAndUpdateOrCreateTal(createTalDto: TrustAnchorList): Promise<TrustAnchorListDocument> {
    const { uri } = createTalDto
    const findTrustAnchorList = await this.trustAnchorListModel.findOneAndUpdate({ uri }, createTalDto, DEFAULT_UPSERT_OPTIONS).exec()

    return findTrustAnchorList
  }

  findX509CredentialDigitalId(ids: IDigitalId[]): IDigitalId {
    return ids.find(id => id.X509Certificate)
  }

  async getCreateTrustAnchorListDto(uri: string, listObject?: ITrustedList): Promise<CreateTrustAnchorListDto> {
    if (!listObject) listObject = await this.getTrustedListObject(uri)
    return {
      uri,
      name: this.getNameAsString(listObject.TrustServiceStatusList.SchemeInformation.SchemeName),
      parserClass: 'eiDASParser'
    }
  }

  getNameAsString(name: IName): string {
    return Array.isArray(name.Name) ? name.Name[0] : name.Name
  }

  getTrustAnchorName(TSPName: IName, ServiceName: IName): string {
    const tspName = this.getNameAsString(TSPName)
    const serviceName = this.getNameAsString(ServiceName)
    return `${tspName} - ${serviceName}`
  }

  async getTrustedListObject(uri: string): Promise<ITrustedList> {
    const response = await this.httpService.get(uri).toPromise()
    const xmlString = response.data
    const tlData: ITrustedList = this.xmlParser.parse(xmlString)

    return tlData
  }

  getTrustServiceProviderServicesFromTrustedList(trustedListObject: ITrustedList): ITSPServiceWithSPName[] {
    let x509TrustServiceProviderServices: ITSPServiceWithSPName[] = []

    try {
      const { TrustServiceProviderList } = trustedListObject.TrustServiceStatusList

      // Make sure we have an iterable array for listTsps
      const { TrustServiceProvider } = TrustServiceProviderList
      const listTsps = getValueAsArray(TrustServiceProvider)

      for (const tsp of listTsps) {
        // filter for services with X509 certificate attribute
        const { TSPService } = tsp.TSPServices
        const filteredServices = this.filterForX509CertificateServices(getValueAsArray(TSPService))

        const filteredServicesWithTSPNames = filteredServices.map(service => ({
          ...service,
          TSPName: tsp.TSPInformation.TSPName
        }))
        x509TrustServiceProviderServices = x509TrustServiceProviderServices.concat(filteredServicesWithTSPNames)
      }
    } catch (error) {
      this.logger.error(error)
    } finally {
      return x509TrustServiceProviderServices
    }
  }
}

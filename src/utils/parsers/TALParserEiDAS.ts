import { XMLParser } from 'fast-xml-parser'
import fetch from 'node-fetch'
import { ITrustAnchorList } from 'interfaces/trustAnchor.interface'
import TALParser from './TALParser'
import { IDigitalId, IName, ITrustedList, ITrustServiceProvider, ITSPService } from '../../interfaces/eiDAS.interface'
import TrustAnchorList from '../../models/trustAnchorList.model'
import { CreateTrustAnchorListDto } from '../../dtos/trustAnchorList.dto'
import { logger } from '../../utils/logger'
import { CreateTrustAnchorDto } from '../../dtos/trustAnchor.dto'
import { getValueAsArray } from '../../utils/util'

// WIP
// TODO: refactor to be usable for any ONE trusted list
// currently only works for list of lists by ec
export default class TALParserEiDAS extends TALParser {
  trustAnchorList: ITrustAnchorList

  private trustAnchorListModel = TrustAnchorList
  private xmlParser: XMLParser

  constructor(_trustAnchorList: ITrustAnchorList) {
    super(_trustAnchorList)

    this.xmlParser = new XMLParser()
  }

  async getNextUpdateDate(): Promise<Date> {
    return new Date()
  }

  async getTrustAnchors(): Promise<CreateTrustAnchorDto[]> {
    /**
     * The eiDAS LOTL is a collection of trusted lists (TL)
     * The TLs are issued by the different member states
     * The locations (uris) of the different lists are located
     * in a respective "OtherTSLPointer" tag, which in turn are
     * collected inside the "PointersToOtherTSL" tag
     */

    // we know that the list of lists has no TrustServiceProviderList itself
    // and instead only contains PointersToOtherTSL
    const lotlData: Omit<ITrustedList, 'TrustServiceProviderList'> = await this.getTrustedListObject(this.trustAnchorList.uri)

    // navigate to the "PointersToOtherTSL" tag
    const pointersToOtherTSL = lotlData.TrustServiceStatusList.SchemeInformation.PointersToOtherTSL.OtherTSLPointer

    // the array to be filled with all trust anchors
    let createTrustAnchorDtos: CreateTrustAnchorDto[] = []

    // for each pointer check if there is a list already in the DB
    // if not create it
    for (const tslPointer of getValueAsArray(pointersToOtherTSL)) {
      try {
        const trustedList = await this.getTrustedListObject(tslPointer.TSLLocation)
        const trustedListTrustAnchors = await this.getTrustAnchorsFromList(trustedList, tslPointer.TSLLocation)

        createTrustAnchorDtos = createTrustAnchorDtos.concat(trustedListTrustAnchors)
      } catch (error) {
        logger.error(error)
        continue
      }
    }

    return createTrustAnchorDtos
  }

  private async getTrustAnchorsFromList(trustedList: ITrustedList, trustedListUri: string): Promise<CreateTrustAnchorDto[]> {
    const { SchemeInformation } = trustedList.TrustServiceStatusList

    const findTal = await this.findAndUpdateOrCreateTal({
      name: this.getNameAsString(SchemeInformation.SchemeName),
      uri: trustedListUri,
      parserClass: 'eiDASParser'
    })
    logger.debug(`[eiDAS LOTL] Found TAL: ${findTal.name} at ${findTal.uri}`)

    const { TrustServiceProviderList } = trustedList.TrustServiceStatusList
    if (!TrustServiceProviderList) return []

    // TODO: we also need to check for PointersToOtherTSL

    // Make sure we have an iterable array for listTsps
    const { TrustServiceProvider } = TrustServiceProviderList
    const listTsps = !Array.isArray(TrustServiceProvider) ? [TrustServiceProvider] : TrustServiceProvider

    logger.debug(`[eiDAS LOTL] Found ${listTsps.length} TSPs for TAL: ${findTal.name}`)

    const createTrustAnchorDtos: CreateTrustAnchorDto[] = []
    for (const tsp of listTsps) {
      // filter for services with X509 certificate attribute
      const { TSPService } = tsp.TSPServices
      const filteredServices = this.filterForX509CertificateServices(getValueAsArray(TSPService))

      logger.debug(`[eiDAS LOTL] Found ${filteredServices.length} X509 certificate services for ${findTal.name}`)

      for (const serviceWithX509 of filteredServices) {
        createTrustAnchorDtos.push(this.getCreateTrustAnchorDtoFromTSPService(serviceWithX509, tsp, findTal))
      }
    }

    return createTrustAnchorDtos
  }

  private getNameAsString(name: IName): string {
    return Array.isArray(name.Name) ? name.Name[0] : name.Name
  }

  private findX509CredentialDigitalId(ids: IDigitalId[]): IDigitalId {
    return ids.find(id => id.X509Certificate)
  }

  private filterForX509CertificateServices(services: ITSPService[]): ITSPService[] {
    const filteredServices = services.filter(service => {
      const { DigitalId } = service.ServiceInformation.ServiceDigitalIdentity
      return this.findX509CredentialDigitalId(getValueAsArray(DigitalId))
    })

    return filteredServices
  }

  private getCreateTrustAnchorDtoFromTSPService(
    service: ITSPService,
    trustServiceProvider: ITrustServiceProvider,
    trustAnchorlist: ITrustAnchorList
  ): CreateTrustAnchorDto {
    const tspName = this.getNameAsString(trustServiceProvider.TSPInformation.TSPName)
    const serviceName = this.getNameAsString(service.ServiceInformation.ServiceName)
    const name = `${tspName} - ${serviceName}`

    const { DigitalId } = service.ServiceInformation.ServiceDigitalIdentity
    const publicKey = this.findX509CredentialDigitalId(getValueAsArray(DigitalId)).X509Certificate

    const _list = trustAnchorlist._id

    return {
      name,
      publicKey,
      _list
    }
  }

  private async findAndUpdateOrCreateTal(createTalDto: CreateTrustAnchorListDto): Promise<ITrustAnchorList> {
    const { uri } = createTalDto
    const findTrustAnchorList = await this.trustAnchorListModel.findOneAndUpdate({ uri }, createTalDto, { upsert: true, setDefaultsOnInsert: true })

    return findTrustAnchorList
  }

  private async getTrustedListObject(uri: string): Promise<ITrustedList> {
    const response = await fetch(uri)

    const xmlString = await response.text()
    const tlData: ITrustedList = this.xmlParser.parse(xmlString)

    return tlData
  }
}

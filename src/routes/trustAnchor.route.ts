import { Request, Response, Router } from 'express'
import fetch from 'node-fetch'
import { RequestTrustAnchorDto } from '../dtos/trustAnchor.dto'
import validationMiddleware from '../middlewares/validation.middleware'
import TrustAnchorController from '../controllers/trustAnchor.controller'
import { Routes } from '../interfaces/routes.interface'
import TrustAnchor from '../models/trustAnchor.model'
import TrustAnchorList from '../models/trustAnchorList.model'
import TrustAnchorListParser, { ParseTypes, TTrustAnchorMap } from '../utils/TrustAnchorListParser'

class TrustAnchorRoute implements Routes {
  public path = '/api/trustAnchor'
  public router = Router()
  public trustAnchorController = new TrustAnchorController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    //this.router.get(`${this.path}`, this.addToDb)
    this.router.get(`${this.path}`, this.parseXml)
    this.router.post(`${this.path}`, validationMiddleware(RequestTrustAnchorDto, 'body'), this.trustAnchorController.getTrustAnchor)
  }

  //TODO: remove after testing
  private async addToDb(req: Request, res: Response) {
    const trustAnchorList = TrustAnchorList
    const trustAnchor = TrustAnchor

    const list = await trustAnchorList.create({
      name: 'Example Trusted List',
      location: 'https://example.com',
      type: 'CSV',
      updateCycle: 604800000 // 1 week
    })

    const inserted = await trustAnchor.insertMany([
      {
        name: 'Anchor #1',
        _list: list._id,
        publicKey: '1234567890'
      },
      {
        name: 'Trust Anchor #2',
        _list: list._id,
        publicKey: '0987654321'
      }
    ])

    return res.status(200).json(inserted)
  }

  //TODO: remove after testing
  private async parseXml(req: Request, res: Response) {
    let data: string
    let type: ParseTypes
    let arrPath: string
    let map: TTrustAnchorMap

    if (req.query.type === 'csv') {
      const csvUri = 'https://ccadb-public.secure.force.com/mozilla/IncludedCACertificateReportPEMCSV'
      const response = await fetch(csvUri)

      data = await response.text()
      console.log('CSV data', data)
      map = {
        name: 'Owner',
        publicKey: 'PEMInfo'
      }
      type = ParseTypes.CSV
    } else {
      const xmlUri = 'https://ec.europa.eu/tools/lotl/eu-lotl.xml'
      const response = await fetch(xmlUri)

      data = await response.text()
      map = {
        name: 'AdditionalInformation.OtherInformation[3].SchemeOperatorName.Name',
        publicKey: 'ServiceDigitalIdentities.ServiceDigitalIdentity.DigitalId.X509Certificate'
      }
      type = ParseTypes.XML
      arrPath = 'TrustServiceStatusList.SchemeInformation.PointersToOtherTSL.OtherTSLPointer'
    }

    const trustAnchors = new TrustAnchorListParser(data, type, map, arrPath).parse()

    return res.status(200).json(trustAnchors)
  }
}

export default TrustAnchorRoute

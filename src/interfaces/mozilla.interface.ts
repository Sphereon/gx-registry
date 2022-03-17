export interface IMozillaCARecord {
  CommonNameorCertificateName: string
  PEMInfo: string
  'ValidFrom[GMT]': string
  'ValidTo[GMT]': string
}

export interface IMozillaCARecordUnfiltered extends IMozillaCARecord {
  [key: string]: string
}

export interface IMozillaCAList {
  records: IMozillaCARecord[]
}

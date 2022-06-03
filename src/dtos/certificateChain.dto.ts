import Joi from 'joi'

export type TCertificateChainRequest = {
  certs: string
}

const certificateChainRules = {
  certs: Joi.string().empty().required()
}

export const certificateChainRequestSchema = Joi.object<TCertificateChainRequest>(certificateChainRules)

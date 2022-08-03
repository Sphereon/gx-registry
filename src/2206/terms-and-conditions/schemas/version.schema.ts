import Joi from 'joi'

export const versionSchema = Joi.object({
  version: Joi.string().empty('').min(3).max(10).optional()
})

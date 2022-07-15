import Joi from 'joi'

export const shapeSchema = Joi.object()
  .keys({
    file: Joi.string().min(3).max(20).optional(),
    type: Joi.string().valid('ttl', 'jsonld').optional()
  })
  .and('file', 'type')

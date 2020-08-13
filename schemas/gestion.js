const Joi = require('@hapi/joi')

const schemaDesActivarEmpresa = Joi.object({
    mensaje: Joi.string().required()
  })

module.exports = {
  schemaDesActivarEmpresa
}
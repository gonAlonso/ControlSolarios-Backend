const Joi = require('@hapi/joi')

const schemaLogin = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
})

const schemaRegisterEmpresa = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    nombreFiscal: Joi.string().min(1).max(255).required(),
    cif: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).required(),
    tlf: Joi.string().min(9).required(),
    direccion: Joi.string().min(10).max(255).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{10,30}$')).required(),
    tipoBono: Joi.string().valid("MINUTOS", "SESIONES").optional()
  })

const schemaRemoveEmpresa = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  })

 
const schemaUpdateEmpresa = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    nombreFiscal: Joi.string().min(1).max(255).optional(),
    cif: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).optional(),
    tlf: Joi.string().min(9).optional(),
    direccion: Joi.string().min(10).max(255).optional(),
    tipoBono: Joi.string().valid("MINUTOS", "SESIONES").optional()
  })

const schemaRegisterOperario = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    dni: Joi.string().alphanum().min(9).max(9).required(),
    pin: Joi.number().min(2).max(99999999).required()
  })
 
const schemaUpdateOperario = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    dni: Joi.string().alphanum().min(9).max(9).optional(),
    pin: Joi.number().min(2).max(99999999).optional(),
    fechaUltimaRevision: Joi.date().optional(),
    //TODO: Se neesita estado?
    //estado: Joi.string().valid("ACTIVO", "ELIMINADO", "MANTENIMIENTO").optional()
  })

const schemaRegisterSolario = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    potencia: Joi.number().min(1).max(5000).required(),
    proximaRevision: Joi.date().required(),
  })

const schemaUpdateSolario = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    potencia: Joi.number().required(),
    proximaRevision: Joi.date().required(),
    estado: Joi.string().valid("ACTIVO", "ELIMINADO", "MANTENIMIENTO").required()
  })

const schemaRegisterSesion = Joi.object({
    energia: Joi.number().min(1).max(2000).required(),
    duracion: Joi.number().min(1).max(60).required(),
    solario: Joi.string().required(),
    pin: Joi.number().min(2).max(99999999).required(),
    operario: Joi.string().required(),
    bono: Joi.string().optional()
  })

  const schemaRegisterLogin = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{10,30}$')).required(),
    tipo: Joi.string().valid("INVITADO","USUARIO", "EMPRESA", "GESTOR", "ADMINISTRADOR", "ELIMINADO").required(),
    referencia: Joi.string().optional()
  })

  const schemaRegisterUsuario = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    dni: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).required(),
    tlf: Joi.string().min(9).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).required(),
    fototipo: Joi.string().min(1).max(5).required()
  })
 
const schemaUpdateUsuario = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    dni: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).optional(),
    tlf: Joi.string().min(9).optional(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).optional(),
    fototipo: Joi.string().min(1).max(5).optional(),
    estado: Joi.string().valid("ACTIVO", "BAJA", "ELIMINADO").optional()
  })

const schemaRegisterBono = Joi.object({
    valor: Joi.number().min(1).max(50).required(),
    tipo: Joi.string().valid("SESIONES", "MINUTOS").required(),
    fechaLimite: Joi.date().greater('now').required()
  })

module.exports = {
    schemaLogin,
    schemaRegisterLogin,
    schemaRegisterEmpresa,
    schemaRemoveEmpresa,
    schemaUpdateEmpresa,
    schemaRegisterOperario,
    schemaUpdateOperario,
    schemaRegisterSolario,
    schemaUpdateSolario,
    schemaRegisterSesion,
    schemaRegisterUsuario,
    schemaUpdateUsuario,
    schemaRegisterBono
}
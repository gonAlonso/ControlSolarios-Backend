
var Login = require('../models/login')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



/*********************************************
* Validaciones de datos
*********************************************/


const schemaLogin= Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  })

/*********************************************
* Funcionalidades implementadas
*********************************************/


async function login(req, res){
    // Validamos campos
    try {
        const { error, value } = await schemaLogin.validateAsync(req.body)
    }
    catch (err) { 
        console.log('error al validar el login'+err)
        return res.status(400).json({accion:'login', mensaje:'Usuario o contraseña inválidos'})
    }

    // Comprobar que el usuario si existe
    let empresaExistente = await Empresa.findOne({email:req.body.email})
    if(!empresaExistente) return res.status(400).json({accion:'save', mensaje:'Error 1 en el email/password. Datos incorrectos'}) 
   
   
    // Comprobamos si el password coincide
    const passwordValido = await bcrypt.compare(req.body.password, empresaExistente.password)
    if(!passwordValido) return res.status(400).json({accion:'save', mensaje:'Error 2 en el email/password. Datos incorrectos'}) 
  
    // Creamos el token jwt (jsonwebtoken)  Ver web: https://jwt.io/
    const token = jwt.sign( 
        {
            _id: empresaExistente._id, 
            exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hora
        }, 
        process.env.TOKEN_SECRETO )
    res.header('auth-token', token)

    res.status(200).send({token}) 

}

module.exports = { login }
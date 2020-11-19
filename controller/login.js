
var Login = require('../models/login')
var Usuario = require('../models/usuario')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
//const { process } = require('@hapi/joi/lib/errors');


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
    let loginExistente = await Login.findOne({
        email:req.body.email,
        tipo: {$ne: "ELIMINADO"}
    })
    if(!loginExistente) {
        return res.status(400).json({accion:'login', mensaje:'Error[0] en el email/password. Datos incorrectos'}) 
    }
   
    // Comprobamos si el usuario esta activo
    if(loginExistente.estado != "ACTIVO") {
        return res.status(401).json({accion:'login', mensaje:'Error[1] en el email/password. Datos incorrectos'}) 
    }
    // Comprobamos si el password coincide
    try {
        const passwordValido = await bcrypt.compare(req.body.password, loginExistente.password)
        if(!passwordValido) throw "Password invalida"
    }
    catch(err) {
        console.log( "Login error", err)
        return res.status(402).json({accion:'login', mensaje:'Error[2] en el email/password. Datos incorrectos'}) 
    }
    // Creamos el token jwt (jsonwebtoken)  Ver web: https://jwt.io/
    const token = jwt.sign( 
        {
            _id: loginExistente._id,
            tipo: loginExistente.tipo,
            referencia: loginExistente.referencia,
            exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hora
        }, 
        process.env.TOKEN_SECRETO )
    res.header('auth-token', token)

    res.status(200).send({token, type: loginExistente.tipo}) 

}


async function verifyLogin(req, res){

    if ( req.params.token == undefined) {
        console.log('error al validar el token')
        return res.status(400).json({accion:'login', mensaje:'Token no valido'})
    }
    let usuario

    try {
        usuario = await jwt.verify(req.params.token, process.env.TOKEN_SECRETO)
    }
    catch(err) {
        console.log("Error: TOKEN EXPIRED")
        return res.status(500).json({accion:'verify', mensaje:'error al verificar el registro. Codigo caducado. Cancelado'}) 
    }
    
    const session = await mongoose.startSession();
    
    try{
        session.startTransaction();
        let loginGuardado
        if (usuario.type == "empresa") {
            console.log("Tipo usuario")
            loginGuardado = await Login.findOne({_id: usuario._id})
        }
        else if (usuario.type == "usuario") {
            console.log("Tipo empresa")
            loginGuardado = await Usuario.findOne({_id: usuario._id})
        }

        if (!loginGuardado) throw "No se encuentra el usuario"

        if (loginGuardado.estado == "ACTIVO") throw "Usuario ya activo"

        loginGuardado.estado = "ACTIVO"
        await loginGuardado.save()
        await session.commitTransaction();
        loginGuardado.password = undefined
        res.status(200).json({accion:'verify', datos: loginGuardado}) 
    }
    catch(err){
        console.log("Error al verificar el correo: "+ err)
        await session.abortTransaction();
        res.status(500).json({accion:'verify', mensaje:'error al guardar los datos de la empresa. Cancelado'}) 
    }
 
 }

module.exports = { login, verifyLogin }
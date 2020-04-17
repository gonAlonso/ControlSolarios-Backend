
//var Puntuacion = require('../models/puntuacion')
var Empresa = require('../models/empresa')
var Solario = require('../models/solario')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/*const schema = {
    nombre: Joi().string().min(3).require(),
    email: Joi().string().min(6).require().email(),
    password: Joi().string().min(3).require(),
}*/



/*********************************************
* Validaciones de datos
*********************************************/
const schemaRegister = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    nombreFiscal: Joi.string().min(1).max(255).required(),
    cif: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).required(),
    tlf: Joi.string().min(9).required(),
    direccion: Joi.string().min(10).max(255).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{10,30}$')).required()
  })

const schemaLogin= Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  })

 
const schemaUpdate = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    nombreFiscal: Joi.string().min(1).max(255).optional(),
    cif: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).optional(),
    tlf: Joi.string().min(9).optional(),
    direccion: Joi.string().min(10).max(255).optional(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).optional(),
    newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{10,30}$')).optional(),
    oldPassword: Joi.ref('password')
  })

/*********************************************
* Funcionalidades implementadas
*********************************************/
async function register(req, res){
   try {
        const { error, value } = await schemaRegister.validateAsync(req.body)
        console.log(value)
        console.log(error)

    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la empresa: '+err}) 
    }
    //return res.status(400).json({accion:'ok'})

    // Comprobar que la empresa no existe antes
    try {
        let empresaExistente = await Empresa.findOne({cif:req.body.cif})
        if(empresaExistente) return res.status(400).json({accion:'register', mensaje:'Error en los datos de empresa. CIF ya existe'}) 
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'Error iesperado en el registro: '+err}) 
    }
   
    // Creamos el hash del password (nunca debemos guardar el password en texto claro)
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const empresa = new Empresa(req.body)
    empresa.estado = "REGISTRADO"
    empresa.password = hashPassword

    empresa.operarios = []
    empresa.fechaRegistro = new Date()
    try{
        let empregisterresaGuardada = await empresa.save();
        res.status(200).json({accion:'register', datos: empregisterresaGuardada}) 
    }catch(err){
        res.status(500).json({accion:'register', mensaje:'error al guardar los datos de la empresa. Cancelado'}) 
    }

}


async function login(req, res){
    // Validamos campos
    try {
        const { error, value } = await schemaLogin.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'save', mensaje:'error al validar el login'+err}) 
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


async function update(req,res){

    // Validar datos de la empresa
    try {
        const { error, value } = await schemaUpdate.validateAsync(req.body)
        console.log(value)
        console.log(error)

    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la empresa: '+err}) 
    }

    try{
        const token = req.user
        let empresaActualizada = await Empresa.findOneAndUpdate({_id:token._id}, req.body, {new:true});
        res.status(200).json({accion:'update', datos: empresaActualizada}) 
    }catch(err){
        res.status(500).json({accion:'update', mensaje:'error al actualizar datos de la empresa: '+err}) 
    }
}

async function getData(req,res){
    let token
    try{
        token = req.user
        let empresaBuscada = await Empresa.findOne({_id:token._id});
        res.status(200).json({accion:'update', datos: empresaBuscada}) 
    }catch(err){
        res.status(500).json({accion:'update', mensaje:`error al recuperar los datos [${token._id}]\n ${err}`}) 
    }
}

/**********************************************/
/**********************************************/
/**********************************************/


async function getData2(req,res) {
    try{
        let datosEmpresa = await Empresa.findById();
        res.status(200).json({accion:'get all', datos: usuarios}) 
    }catch(err){
        res.status(500).json({accion:'get all', mensaje:'error al obtener los usuarios'}) 
    }

}






async function getById(req,res) {
    let usuarioId = req.params.id;

    try{
        let usuario = await Usuario.findById(usuarioId);
        res.status(200).json({accion:'get one', datos: usuario}) 
    }catch(err){
        res.status(500).json({accion:'get one', mensaje:'error al obtener el usuario'}) 
    }
}




/*async function insert(req, res){
    const usuario = new Usuario(req.body)
    try{
        let usuarioGuardado = await usuario.save();
        res.status(200).json({accion:'save', datos: usuarioGuardado}) 
    }catch(err){
        res.status(500).json({accion:'save', mensaje:'error al guardar el usuario'}) 
    }
    
}*/

async function remove(req,res){
    let usuarioId = req.params.id;
    try{
        let usuarioBorrado = await Usuario.findByIdAndDelete(usuarioId);
        res.status(200).json({accion:'delete', datos: usuarioBorrado}) 
    }catch(err){
        res.status(500).json({accion:'delete', mensaje:'error al borrar el usuario'}) 
    }
   
}



// Ojo con populate
async function getPuntuacionesUsuario(req,res) {
    let usuarioId = req.params.id;

    try{
        let usuario = await Usuario.findById(usuarioId).populate('puntuaciones');
        res.status(200).json({accion:'get one', datos: usuario}) 
    }catch(err){
        res.status(500).json({accion:'get one', mensaje:'error al obtener el usuario'}) 
    }
}





module.exports = {register, login, update, remove, getData}
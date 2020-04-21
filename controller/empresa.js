
//var Puntuacion = require('../models/puntuacion')
var Empresa = require('../models/empresa')
var Login = require('../models/login')
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

const schemaRemove = Joi.object({
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
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la empresa: '+err}) 
    }
    
    try {
        let loginExistente = await Login.findOne({email:req.body.email})
        if(loginExistente) throw "Login ya existe"
    }
    catch (err) { 
        console.log('Error iesperado en el registro: '+err) 
        return res.status(400).json({accion:'register', mensaje:'Error en los datos de empresa. Login ya existe'}) 
    }

    // Comprobar que la empresa no existe antes
    try {
        let empresaExistente = await Empresa.findOne({cif:req.body.cif})
        if(empresaExistente) throw "CIF ya existe"
    }
    catch (err) { 
        console.log('Error inesperado en el registro: '+err) 
        return res.status(400).json({accion:'register', mensaje:'Error en los datos de empresa. CIF ya existe'}) 
    }
   
    // Creamos el hash del password (nunca debemos guardar el password en texto claro)
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const empresaDoc = new Empresa({
        nombre: req.body.nombre,
        cif: req.body.cif,
        tlf: req.body.tlf,
        nombreFiscal: req.body.nombreFiscal,
        direccion: req.body.direccion,
        fechaRegistro: {type: Date, default: Date.now},
        estado: "REGISTRADO",
        tipoBono: req.body.tipoBono,
        fechaRegistro: new Date()
    })

    const loginDoc = new Login({
        email: req.body.email,
        password: hashPassword,
        tipo: "EMPRESA"
    })
    
    const session = await mongoose.startSession();
    try{
        session.startTransaction();
        let loginGuardado = await loginDoc.save({upsert:false})
        empresaDoc.login = loginGuardado
        let empresaGuardada = await empresaDoc.save({upsert:false})
        loginGuardado.referencia = empresaGuardada
        await loginGuardado.save()
        await session.commitTransaction();
        res.status(200).json({accion:'register', datos: empresaGuardada}) 
    }catch(err){
        console.log("Error de registro de empresa: "+ err)
        await session.abortTransaction();
        res.status(500).json({accion:'register', mensaje:'error al guardar los datos de la empresa. Cancelado'}) 
    }

}



async function update(req,res){

    // Validar datos de la empresa
    try {
        const { error, value } = await schemaUpdate.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la empresa: '+err}) 
    }

    try{
        const token = req.user
        let empresaActualizada = await Empresa.findOneAndUpdate({
            _id:token._id},
            req.body, {new:true});
        if (!empresaActualizada) throw "No se encuentra la empresa" // Nunca debería suceder esta condicion
        res.status(200).json({accion:'update', datos: empresaActualizada}) 
    }catch(err){
        res.status(500).json({accion:'update', mensaje:'error al actualizar datos de la empresa: '+err}) 
    }
}

async function getData(req,res){
    let token
    try{
        token = req.user

        let empresaBuscada = await Empresa.findOne({_id:token.referencia});
        res.status(200).json({accion:'getdata', datos: empresaBuscada}) 
    }catch(err){
        res.status(500).json({accion:'getdata', mensaje:`error al recuperar los datos [${token._id}]\n ${err}`}) 
    }
}



async function remove(req, res){
    try { const { error, value } = await schemaRemove.validateAsync(req.body)}
    catch (err) {
        console.log('Error al eliminar la empresa: '+err)
        return res.status(400).json({accion:'delete', mensaje:'error al validar los datos'})
    }
    
    const session = await mongoose.startSession();
    console.log( req.body )
    try{
        session.startTransaction();
        let loginDesactivado = await Login.findOneAndUpdate(
            {
                _id: req.user._id,
                email: req.body.email,
                tipo: {$ne : "ELIMINADO"}
            },
            {tipo: "ELIMINADO"},
            {new:true}).session(session)
        if(!loginDesactivado) throw "Login no encontrado"

        const passwordValido = await bcrypt.compare(req.body.password, loginDesactivado.password)
        if(!passwordValido) throw "Login incorrecto"

        let empresaDesactivada = await Empresa.findOneAndUpdate(
            {_id: req.user.referencia, tipo: {$ne: "BAJA"} },
            {estado: "BAJA"},
            {new:true}).session(session)
        if(!empresaDesactivada) throw "Empresa no encontrada"

        res.status(200).json({
            accion:'delete',
            datos: {login: loginDesactivado, empresa: empresaDesactivada}}) 
    }catch(err){
        console.log("Error al eliminar la empresa: "+ err)
        await session.abortTransaction();
        res.status(500).json({accion:'delete', mensaje:'Error al guardar los datos de la empresa. No permitido'}) 
    }
 }
/**********************************************/
/**********************************************/
/**********************************************/

/*

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




async function insert(req, res){
    const usuario = new Usuario(req.body)
    try{
        let usuarioGuardado = await usuario.save();
        res.status(200).json({accion:'save', datos: usuarioGuardado}) 
    }catch(err){
        res.status(500).json({accion:'save', mensaje:'error al guardar el usuario'}) 
    }
    

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

*/



module.exports = {register, update, remove, getData}
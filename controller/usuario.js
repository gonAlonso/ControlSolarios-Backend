
var Usuario = require('../models/usuario')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')




/*********************************************
* Validaciones de datos
*********************************************/
const schemaRegister = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    dni: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).required(),
    tlf: Joi.string().min(9).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).required(),
    fototipo: Joi.string().min(1).max(5).required()
  })



 
const schemaUpdate = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    dni: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{9}$' )).optional(),
    tlf: Joi.string().min(9).optional(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true }}).optional(),
    fototipo: Joi.string().min(1).max(5).optional(),
    estado: Joi.string().valid("ACTIVO", "BAJA", "ELIMINADO").optional()
  })

/*********************************************
* Funcionalidades implementadas
*********************************************/

async function register(req, res){

    try {
        const { error, value } = await schemaRegister.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos del usuario: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        let empresaId = req.user
        let usuarioNuevo = new Usuario(req.body)
        usuarioNuevo.empresa = empresaId
        let usuarioBuscado = await Usuario.findOne({
            dni: usuarioNuevo.dni,
            empresa: usuarioNuevo.empresa
        })
        if(usuarioBuscado) throw "Usuario ya registrado"

        // Guardamos la puntuacion
        let usuarioGuardado = await usuarioNuevo.save();
        await session.commitTransaction();
        res.status(200).json({accion:'save', datos: usuarioGuardado}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'save', mensaje:'error al guardar el usuario: '+err}) 
    }finally{
        session.endSession();
    }
    
}

async function remove(req,res){
    try{
        const token = req.user
        let idUsuario= req.params.id
        let usuario = {estado: "ELIMINADO"}
        let operarioEliminado = await Usuario.findOneAndUpdate({
                _id: idUsuario,
                empresa: token._id,
                estado: { $ne :"ELIMINADO"}
            },
            usuario, {new:true});
        if(!operarioEliminado) throw "No se ha encontrado operario"
        return res.status(200).json({accion:'update', datos: operarioEliminado})
    }catch(err){
        return res.status(500).json({accion:'update', mensaje:'error al eliminar el usuario: '+err}) 
    }
}

async function update(req,res){
    try {
        const { error, value } = await schemaUpdate.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'update', mensaje:'error al validar los datos del usuario: '+err}) 
    }

    try{
        const token = req.user
        let idUsuario = req.params.id
        let usuarioActualizado = await Usuario.findOneAndUpdate({
                _id: idUsuario,
                empresa: token._id
            },
            req.body, {new:true});
        if(!usuarioActualizado) throw "No se ha encontrado usuario"
        return res.status(200).json({accion:'update', datos: usuarioActualizado})
    }catch(err){
        return res.status(500).json({accion:'update', mensaje:'error al actualizar datos del usuario: '+err}) 
    }
}


async function getAll(req,res){
    try{
        const token = req.user
        let listaUsuarios = await Usuario.find({empresa: token._id})
        return res.status(200).json({accion:'getall', datos: listaUsuarios}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar usuarios de esta empresa:'+err}) 
    }
   
}

module.exports = {register, update, remove, getAll }
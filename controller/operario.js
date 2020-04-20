
var Operario = require('../models/operario')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')
//const bcrypt = require('bcrypt')
//const jwt = require('jsonwebtoken')




/*********************************************
* Validaciones de datos
*********************************************/
const schemaRegister = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    dni: Joi.string().alphanum().min(9).max(9).required(),
    pin: Joi.number().min(2).max(99999999).required()
  })



 
const schemaUpdate = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    dni: Joi.string().alphanum().min(9).max(9).optional(),
    pin: Joi.number().min(2).max(99999999).optional(),
    fechaUltimaRevision: Joi.date().optional(),
    //TODO: Se neesita estado?
    //estado: Joi.string().valid("ACTIVO", "ELIMINADO", "MANTENIMIENTO").optional()
  })

/*********************************************
* Funcionalidades implementadas
*********************************************/

async function register(req, res){

    try {
        const { error, value } = await schemaRegister.validateAsync(req.body)
        //console.log(`Error: ${error} :: Value: ${value}`)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos del operario: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        let empresaId = req.user
        // Creamos un nuevo operario (con el body)
        let operarioNuevo = new Operario(req.body)
        // Referencia a la empresa en el documento solario
        operarioNuevo.empresa = empresaId
        // Comprobar si ya esta registrado
        let operarioBuscado = await Operario.findOne({
            dni: operarioNuevo.dni,
            empresa: operarioNuevo.empresa
        })
        if(operarioBuscado) throw "Operario ya registrado"

        // Guardamos la puntuacion
        let operarioGuardado = await operarioNuevo.save();
        await session.commitTransaction();
        res.status(200).json({accion:'save', datos: operarioGuardado}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'save', mensaje:'error al guardar el operario: '+err}) 
    }finally{
        session.endSession();
    }
    
}

async function remove(req,res){
    try{
        const token = req.user
        let idSolario = req.params.id;
        let operarioBorrado = await Operario.findOneAndDelete({
            _id: idSolario,
            empresa: token._id
        })
        if (operarioBorrado==null)
            return res.status(200).json({
                accion:'delete', mensaje: `ID operario invalido ::[${idSolario}] Propietario[${token._id}]`
            }) 
        return res.status(200).json({accion:'delete', datos: operarioBorrado}) 
    }catch(err){
        return res.status(500).json({accion:'delete', mensaje:'error al borrar el operario:'+err}) 
    }
   
}

async function update(req,res){
    try {
        const { error, value } = await schemaUpdate.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'update', mensaje:'error al validar los datos del operario: '+err}) 
    }

    try{
        const token = req.user
        let idOperario = req.params.id
        //console.log(`OPERARIO: ${idOperario} :: EMpresa: ${value}`)
        let operarioActualizado = await Operario.findOneAndUpdate({
                _id: idOperario,
                empresa: token._id
            },
            req.body, {new:true});
        if(!operarioActualizado) throw "No se ha encontrado operario"
        return res.status(200).json({accion:'update', datos: operarioActualizado})
    }catch(err){
        return res.status(500).json({accion:'update', mensaje:'error al actualizar datos del operario: '+err}) 
    }
}


async function getAll(req,res){
    try{
        const token = req.user
        let listaOperarios = await Operario.find({empresa: token._id})
        return res.status(200).json({accion:'getall', datos: listaOperarios}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar operarios de esta empresa:'+err}) 
    }
   
}

module.exports = {register, update, remove, getAll }
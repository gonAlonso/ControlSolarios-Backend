
var Solario = require('../models/solario')
var Empresa = require('../models/empresa')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')




/*********************************************
* Validaciones de datos
*********************************************/
const schemaRegister = Joi.object({
    nombre: Joi.string().min(1).max(255).required(),
    pontencia: Joi.number().min(1).max(5000).required()
  })



 
const schemaUpdate = Joi.object({
    nombre: Joi.string().min(1).max(255).optional(),
    potencia: Joi.number().optional(),
    fechaUltimaRevision: Joi.date().optional(),
    estado: Joi.string().valid("ACTIVO", "ELIMINADO", "MANTENIMIENTO").optional()
  })

/*********************************************
* Funcionalidades implementadas
*********************************************/

async function register(req, res){

    try {
        const { error, value } = await schemaRegister.validateAsync(req.body)
        console.log(`Error: ${error} :: Value: ${value}`)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la empresa: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();

        let empresaId = req.user
        // Buscamos la empresa en la BD
        let empresaBuscada = await Empresa.findById(empresaId);
        // Creamos un nuevo solario (con el body)
        let solarioNuevo = new Solario(req.body)
        // Referencia a la empresa en el documento solario
        solarioNuevo.propietario = empresaId
        // Guardamos la puntuacion
        let solarioGuardado = await solarioNuevo.save();
        // colocamos la puntuación dentro del usuario 
        //empresaBuscada.solarios.push(solarioGuardado)
        // Guardamos el usuario
        //let empresaGuardada = await empresaBuscada.save();

        await session.commitTransaction();
        //session.endSession();

        res.status(200).json({accion:'save', datos: solarioGuardado}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'save', mensaje:'error al guardar el solario\n'+err}) 
    }finally{
        session.endSession();
    }
    
}

async function remove(req,res){
    try{
        const token = req.user
        let idSolario = req.params.id;
        let solarioBorrado = await Solario.findOneAndDelete({
            _id: idSolario,
            propietario: token._id
        })
        if (solarioBorrado==null)
            return res.status(200).json({
                accion:'delete', mensaje: `ID solario invalido ::[${idSolario}] Propietario[${token._id}]`
            }) 
        return res.status(200).json({accion:'delete', datos: solarioBorrado}) 
    }catch(err){
        return res.status(500).json({accion:'delete', mensaje:'error al borrar el solario:'+err}) 
    }
   
}

async function update(req,res){
    try {
        const { error, value } = await schemaUpdate.validateAsync(req.body)
        console.log(`ERROR: ${error} :: Value: ${value}`)
    }
    catch (err) { 
        return res.status(400).json({accion:'update', mensaje:'error al validar los datos del solario: '+err}) 
    }

    try{
        const token = req.user
        let idSolario = req.params.id
        let solarioActualizado = await Solario.findOneAndUpdate({
                _id: idSolario,
                propietario: token._id
            },
            req.body, {new:true});
        return res.status(200).json({accion:'update', datos: solarioActualizado}) 
    }catch(err){
        return res.status(500).json({accion:'update', mensaje:'error al actualizar datos del solario: '+err}) 
    }
}


async function getAll(req,res){
    try{
        const token = req.user
        let listaSolarios = await Solario.find({propietario: token._id})
        return res.status(200).json({accion:'delete', datos: listaSolarios}) 
    }catch(err){
        return res.status(500).json({accion:'delete', mensaje:'error al listar solarios de esta empresa:'+err}) 
    }
   
}

module.exports = {register, update, remove, getAll }
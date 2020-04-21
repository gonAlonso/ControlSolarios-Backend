var Sesion = require('../models/sesion')
var Usuario = require('../models/usuario')
var Operario = require('../models/operario')
var Empresa = require('../models/empresa')
var Bono = require('../models/bono')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')


/*********************************************
* Validaciones de datos
*********************************************/
const schemaDesActivarEmpresa = Joi.object({
    accion: Joi.string().valid("REGISTRADO","ACTIVO", "BAJA", "IMPAGO").required()
  })


/*********************************************
* Funcionalidades implementadas
*********************************************/

async function activar(req, res){

    try {
        const { error, value } = await schemaDesActivarEmpresa.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'activar', mensaje:'error al validar los datos de la gestion '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        let empresaId = req.params.idempresa
       
        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: empresaId},
            {estado: req.body.estado},
            {new:true})
        if(!empresaActualizada) throw "No se ha encontrado la empresa "

        await session.commitTransaction();
        res.status(200).json({accion:'save', datos: empresaActualizada})
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'save', mensaje:`error al guardar la sesion [${err}]`})
        console.log(`Register ERROR: ${err}, Op: ${idOperario}, Em: ${empresaId}, Us: ${idUsuario}, No: ${idBono}`) 
    }finally{
        session.endSession();
    }
    
}

async function remove(req,res){
    try{
        throw "No IMPLEMENTADO"
        const token = req.user
        let idSesion = req.params.id

        let sesionEliminada = await Sesion.findOneAndDelete({
                _id: idSesion,
                empresa: token._id
            },
            {sort:{fecha:-1}},
            {limit: 1})
        if(!sesionEliminada) throw "No se ha podido eliminar la sesion"
        return res.status(200).json({accion:'delete', datos: sesionEliminada})
    }catch(err){
        console.log( "ERROR: " +err) 
        return res.status(500).json({accion:'delete', mensaje:'error al eliminar la sesion'})
    }
}


async function getAllEmpresas(req,res){
    try{
        const token = req.user
        let listaSesiones = await Sesion.find({
            empresa: token._id
        })
        return res.status(200).json({accion:'getall', datos: listaSesiones}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar sesiones:'+err}) 
    }
   
}

async function getAllUsuarios(req,res){
    try{
        const token = req.user
        let listaSesiones = await Sesion.find({
            empresa: token._id
        })
        return res.status(200).json({accion:'getall', datos: listaSesiones}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar sesiones:'+err}) 
    }
   
}

async function getUsuario(req,res){
    try{
        const token = req.user
        let idUsuario = req.params.user
        let listaSesiones = await Sesion.find({
            empresa: token._id,
            usuario: idUsuario
        })
        return res.status(200).json({accion:'getuser', datos: listaSesiones}) 
    }catch(err){
        console.log("getUsuario error: " + err)
        return res.status(500).json({accion:'getuser', mensaje:'error al listar sesiones de este usuario'}) 
    }
   
}

module.exports = {activar, remove, getAllUsuarios, getUsuario, getAllEmpresas }
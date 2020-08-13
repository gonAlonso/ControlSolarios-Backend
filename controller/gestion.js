var Sesion = require('../models/sesion')
var Usuario = require('../models/usuario')
var Operario = require('../models/operario')
var Empresa = require('../models/empresa')
var Bono = require('../models/bono')
var Gestion = require('../models/gestion')

var mongoose = require('mongoose');
const Joi = require('@hapi/joi')

const {
    schemaDesActivarEmpresa
} = require('../schemas/gestion')


/*********************************************
* Funcionalidades implementadas
*********************************************/

async function activarEmpresa(req, res){

    try {
        const { error, value } = await schemaDesActivarEmpresa.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'activarempresa', mensaje:'error al validar los datos de la gestion '+err}) 
    }

    const sesion = await mongoose.startSession();

    try{
        sesion.startTransaction();
        let empresaId = req.params.id
        
        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: empresaId, estado: { $ne: "ACTIVO"}},
            {estado: "ACTIVO"},
            {new:true}).session(sesion)

        if(!empresaActualizada) throw "No se ha encontrado la empresa "

        let gestion = new Gestion({
            gestor: req.user._id,
            mensaje: req.body.mensaje,
            accion: {
                tipo: "EMPRESA",
                id: empresaId,
                accion: "ACTIVO"
            }
        })
        let gestionGuardada = await gestion.save(sesion)
        if(!gestionGuardada) throw "No se ha podido guardar la gestion"

        await sesion.commitTransaction();
        res.status(200).json({accion:'activarempresa', datos: empresaActualizada})
    }catch(err){
        await sesion.abortTransaction();
        res.status(500).json({accion:'activarempresa', mensaje:`error al guardar cambios [${err}]`})
    }finally{
        sesion.endSession();
    }    
}


async function desactivarEmpresa(req, res){
    try {
        const { error, value } = await schemaDesActivarEmpresa.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'desactivarempresa', mensaje:'error al validar los datos de la gestion '+err}) 
    }

    const sesion = await mongoose.startSession();

    try{
        sesion.startTransaction();
        let empresaId = req.params.id
        
        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: empresaId, estado: { $ne: "DESACTIVADO"}},
            {estado: "DESACTIVADO"},
            {new:true}).session(sesion)

        if(!empresaActualizada) throw "No se ha encontrado la empresa "

        let gestion = new Gestion({
            gestor: req.user._id,
            mensaje: req.body.mensaje,
            accion: {
                tipo: "EMPRESA",
                id: empresaId,
                accion: "DESACTIVADO"
            }
        })
        let gestionGuardada = await gestion.save(sesion)
        if(!gestionGuardada) throw "No se ha podido guardar la gestion"

        await sesion.commitTransaction();
        res.status(200).json({accion:'desactivarempresa', datos: empresaActualizada})
    }catch(err){
        await sesion.abortTransaction();
        res.status(500).json({accion:'desactivarempresa', mensaje:`error al guardar cambios [${err}]`})
    }finally{
        sesion.endSession();
    }    
}

async function impagoEmpresa(req, res){
    try {
        const { error, value } = await schemaDesActivarEmpresa.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'impagoempresa', mensaje:'error al validar los datos de la gestion '+err}) 
    }

    const sesion = await mongoose.startSession();

    try{
        sesion.startTransaction();
        let empresaId = req.params.id
        
        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: empresaId, estado: { $ne: "IMPAGO"}},
            {estado: "IMPAGO"},
            {new:true}).session(sesion)

        if(!empresaActualizada) throw "No se ha encontrado la empresa "

        let gestion = new Gestion({
            gestor: req.user._id,
            mensaje: req.body.mensaje,
            accion: {
                tipo: "EMPRESA",
                id: empresaId,
                accion: "IMPAGO"
            }
        })
        let gestionGuardada = await gestion.save(sesion)
        if(!gestionGuardada) throw "No se ha podido guardar la gestion"

        await sesion.commitTransaction();
        res.status(200).json({accion:'impagoempresa', datos: empresaActualizada})
    }catch(err){
        await sesion.abortTransaction();
        res.status(500).json({accion:'impagoempresa', mensaje:`error al guardar cambios [${err}]`})
    }finally{
        sesion.endSession();
    }    
}


async function getAllEmpresas(req,res){
    try{
        let listaEmpresa = await Empresa.find({})
        return res.status(200).json({accion:'getallempresas', datos: listaEmpresa}) 
    }catch(err){
        return res.status(500).json({accion:'getallempresas', mensaje:'error al listar empresas:'+err}) 
    }
   
}


module.exports = {
    impagoEmpresa,
    activarEmpresa,
    desactivarEmpresa,
    getAllEmpresas
}
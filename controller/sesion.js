
var Sesion = require('../models/sesion')
var Usuario = require('../models/usuario')
var Operario = require('../models/operario')
var Bono = require('../models/bono')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')




/*********************************************
* Validaciones de datos
*********************************************/
const schemaRegister = Joi.object({
    energia: Joi.number().min(1).max(500).required(),
    duracion: Joi.number().min(1).max(60).required(),
    solario: Joi.string().required(),
    pin: Joi.number().min(2).max(99999999).required(),
    operario: Joi.string().required(),
    bono: Joi.string().optional()
  })


/*********************************************
* Funcionalidades implementadas
*********************************************/

async function register(req, res){

    try {
        const { error, value } = await schemaRegister.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la sesion: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        const token = req.user
        let empresaId = req.user
        let idUsuario = req.params.user
        let idBono = req.params.bono
        let idOperario = req.body.operario
        let pinOperario = req.body.pin
        req.body.operatio = undefined
        req.body.pin = undefined
        
        let usuarioBuscado = await Usuario.findOne({
            _id: idUsuario,
            empresa: empresaId
        })
        if(!usuarioBuscado) throw "No existe usuario especificado"

        let operarioBuscado = await Operario.findOne({
            _id: idOperario,
            empresa: empresaId
        })
        if(!operarioBuscado) throw "No existe operario especificado"
        if(operarioBuscado.pin != pinOperario) throw "Identifiación operario incorrecta"

        if(idBono){
            let bonoActualizado = await Bono.findOneAndUpdate({
                    _id: idBono,
                    empresa: token._id
                },
                {$inc: {restante: -1}},
                {new:true}).session(session)
            if(!bonoActualizado) throw "No se ha encontrado el bono"
            if(bonoActualizado.restante <0) throw "Bono agotado"
        }

        let sesionNueva = new Sesion(req.body)
        sesionNueva.empresa = empresaId
        sesionNueva.usuario = idUsuario
        let sesionGuardada = await sesionNueva.save(session);
        await session.commitTransaction();
        res.status(200).json({accion:'save', datos: sesionGuardada})
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


async function getAll(req,res){
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

module.exports = {register, remove, getAll, getUsuario }
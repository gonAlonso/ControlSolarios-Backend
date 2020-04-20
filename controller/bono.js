
var Bono = require('../models/bono')
var Usuario = require('../models/usuario')
var mongoose = require('mongoose');
const Joi = require('@hapi/joi')




/*********************************************
* Validaciones de datos
*********************************************/
const schemaRegister = Joi.object({
    valor: Joi.number().min(1).max(50).required(),
    tipo: Joi.string().valid("SESIONES", "MINUTOS").required(),
    fechaLimite: Joi.date().greater('now').required()
  })

/*********************************************
* Funcionalidades implementadas
*********************************************/

async function register(req, res){

    try {
        const { error, value } = await schemaRegister.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos del bono: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        let empresaId = req.user
        let idUsuario= req.params.id
        
        let usuarioBuscado = await Usuario.findOne({
            _id: idUsuario,
            empresa: empresaId
        })
        if(!usuarioBuscado) throw "Usuario no registrado"

        let bonoNuevo = new Bono(req.body)
        bonoNuevo.empresa = empresaId
        bonoNuevo.usuario = idUsuario
        bonoNuevo.restante = bonoNuevo.valor
        let bonoGuardado = await bonoNuevo.save();
        await session.commitTransaction();
        res.status(200).json({accion:'save', datos: bonoGuardado}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'save', mensaje:'error al guardar el bono: '+err}) 
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
    const session = await mongoose.startSession();
    try{
        const token = req.user
        let idUsuario = req.params.id
        session.startTransaction();
        let bonoActualizado = await Bono.findOneAndUpdate({
                _id: idUsuario,
                empresa: token._id
            },
            {$inc: {restante: -1}},
            {new:true}).session(session)
        if(!bonoActualizado) throw "No se ha encontrado el bono"

        if(bonoActualizado.restante < 0) throw "Bono agotado"

        await session.commitTransaction();
        return res.status(200).json({accion:'update', datos: bonoActualizado})
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        return res.status(500).json({accion:'update', mensaje:'error al actualizar el bono: '+err}) 
    }
}

async function getAll(req,res){
    try{
        const token = req.user
        let listaBonos = await Bono.find({
            empresa: token._id
        })
        return res.status(200).json({accion:'getall', datos: listaBonos}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar bonos de este usuario:'+err}) 
    }
   
}

async function getUsuario(req,res){
    try{
        const token = req.user
        let idUsuario = req.params.id
        let listaBonos = await Bono.find({
            empresa: token._id,
            usuario: idUsuario
        })
        return res.status(200).json({accion:'getall', datos: listaBonos}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar bonos de este usuario:'+err}) 
    }
   
}

module.exports = {register, update, remove, getAll, getUsuario }
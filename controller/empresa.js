
//var Puntuacion = require('../models/puntuacion')
var Empresa = require('../models/empresa')
var EstadosEmpresa = require('../models/estadosempresa')
var Login = require('../models/login')
var Solario = require('../models/solario')
var Usuario = require('../models/usuario')
var Bono = require('../models/bono')
var Operario = require('../models/operario')
var Sesion = require('../models/sesion')

var mongoose = require('mongoose');
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
//const jwt = require('jsonwebtoken')

const {
    schemaRegisterEmpresa,
    schemaRemoveEmpresa,
    schemaUpdateEmpresa,
    schemaRegisterOperario,
    schemaUpdateOperario,
    schemaRegisterSolario,
    schemaUpdateSolario,
    schemaRegisterSesion,
    schemaRegisterUsuario,
    schemaUpdateUsuario,
    schemaRegisterBono
} = require('../schemas/admin')

/*********************************************
* Funcionalidades implementadas
*********************************************/
async function registerEmpresa(req, res){
   try {
        const { error, value } = await schemaRegisterEmpresa.validateAsync(req.body)
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


async function registerEstado(req, res){
    let estado = new EstadosEmpresaSchema( req.body)
    return res.status(200).json({accion:'registerestado', mensaje: "No implementado"}) 
}

async function updateEmpresa(req,res){

    // Validar datos de la empresa
    try {
        const { error, value } = await schemaUpdateEmpresa.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la empresa: '+err}) 
    }

    try{
        let empresaActualizada = await Empresa.findOneAndUpdate({
            _id: req.user.referencia},
            req.body, {new:true});
        if (!empresaActualizada) throw "No se encuentra la empresa" // Nunca debería suceder esta condicion
        res.status(200).json({accion:'update', datos: empresaActualizada}) 
    }catch(err){
        res.status(500).json({accion:'update', mensaje:'error al actualizar datos de la empresa: '+err}) 
    }
}

async function getDataEmpresa(req,res){
    try{
        let empresaBuscada = await Empresa.findOne({_id: req.user.referencia});
        res.status(200).json({accion:'getdata', datos: empresaBuscada}) 
    }catch(err){
        res.status(500).json({accion:'getdata', mensaje:`error al recuperar los datos [${token._id}]\n ${err}`}) 
    }
}

async function removeEmpresa(req, res){
    try { const { error, value } = await schemaRemoveEmpresa.validateAsync(req.body)}
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

        let nuevoEstado = new EstadosEmpresa({
            fecha: Date.now,
            estado: "BAJA",
            gestor: req.user._id
        })

        let empresaDesactivada = await Empresa.findOneAndUpdate(
            {_id: req.user.referencia, tipo: {$ne: "BAJA"} },
            {estado: "BAJA",
            $push: {historicoEstados: nuevoEstado}
            },
            {new:true}).session(session)
        if(!empresaDesactivada) throw "Empresa no encontrada"
        //TODO: Añadir al historico de cambios

        await session.commitTransaction();

        res.status(200).json({
            accion:'delete',
            datos: {login: loginDesactivado, empresa: empresaDesactivada}}) 
    }catch(err){
        console.log("Error al eliminar la empresa: "+ err)
        await session.abortTransaction();
        res.status(500).json({accion:'delete', mensaje:'Error al guardar los datos de la empresa. No permitido'}) 
    }
}


async function registerSolario(req, res){

    try {
        const { error, value } = await schemaRegisterSolario.validateAsync(req.body)
    }
    catch (err) { 
        console.log("RegisterSolario Error: " + err)
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos del solario'}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();

        let solarioNuevo = new Solario(req.body)

        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: req.user.referencia },
            {$push: {solarios: solarioNuevo}},
            {new:true}).session(session)

        await session.commitTransaction()
        res.status(200).json({accion:'save', datos: empresaActualizada}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'save', mensaje:'error al guardar el solario\n'+err}) 
    }finally{
        session.endSession();
    }
    
}

async function removeSolario(req,res){
    try{
        let idSolario = req.params.id;
        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: req.user.referencia},
            {
                $pull: {
                    'solarios': {_id: idSolario}
                }
            },
            {new:true})
        if (!empresaActualizada) throw "No se ha actualizado los datos de la empresa"
        return res.status(200).json({accion:'delete', datos: empresaActualizada}) 
    }catch(err){
        return res.status(500).json({accion:'delete', mensaje:'error al borrar el solario:'+err}) 
    }  
}

async function updateSolario(req,res){
    try {
        const { error, value } = await schemaUpdateSolario.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'update', mensaje:'error al validar los datos del solario: '+err}) 
    }

    try{
        let idSolario = req.params.id
        req.body._id = idSolario
        let empresaActualizada = await Empresa.findOneAndUpdate({
                _id: req.user.referencia,
                "solarios._id": idSolario
            },
            {$set: {"solarios.$": req.body}},
            {new:true});
        if(!empresaActualizada) throw "No se ha actualizado la empresa"
        return res.status(200).json({accion:'update', datos: empresaActualizada}) 
    }catch(err){
        console.log("UpdateSolario Error: "+err)
        return res.status(500).json({accion:'update', mensaje:'error al actualizar datos del solario'})
    }
}

async function registerSesion(req, res){

    try {
        const { error, value } = await schemaRegisterSesion.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos de la sesion: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();
        let empresaId = req.user.referencia
        let idUsuario = req.params.user
        let idBono = req.body.bono
        let idOperario = req.body.operario
        let pinOperario = req.body.pin
        req.body.operatio = undefined
        req.body.pin = undefined
        
        let usuarioBuscado = await Usuario.findOne({
            _id: idUsuario,
            empresa: empresaId
        })
        if(!usuarioBuscado) throw "No existe usuario especificado"

        let operarioBuscado = await Empresa.findOne({
            _id: empresaId,
            operarios: {$elemMatch: {
                _id: idOperario,
                pin: pinOperario
            }}})
        if(!operarioBuscado) throw "Operario no válido"

        let bonosrestantes
        if(usuarioBuscado.bono != null){
            usuarioBuscado.bono.restante -= 1
            if(usuarioBuscado.bono.restante  <1){
                usuarioBuscado.bono = null
                bonosrestantes = "Bonos agotados"
            }
            else bonosrestantes = "Quedan " + usuarioBuscado.bono.restante + " bonos"
            usuarioBuscado.save(session)
        }

        let sesionNueva = new Sesion(req.body)

        sesionNueva.empresa = empresaId
        sesionNueva.usuario = idUsuario
        let sesionGuardada = await sesionNueva.save(session);
        await session.commitTransaction();
        res.status(200).json({
            accion:'savesesion',
            datos: sesionGuardada,
            bonosrestantes})
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        console.log('Register ERROR: ' + err) 
        res.status(500).json({accion:'savesesion', mensaje:`error al guardar la sesion [${err}]`})
    }finally{
        session.endSession();
    }
}

async function getSesionesUsuario(req,res){
    try{
        let listaSesiones = await Sesion.find({
            empresa: req.user.referencia,
            usuario: req.params.user
        })
        return res.status(200).json({accion:'getsesionesusuario', datos: listaSesiones}) 
    }catch(err){
        return res.status(500).json({accion:'getsesionesusaurio', mensaje:'error al listar sesiones:'+err}) 
    } 
}

async function getSesiones(req,res){
    try{
        let listaSesiones = await Sesion.find({
            empresa: req.user.referencia
        })
        return res.status(200).json({accion:'getallsesiones', datos: listaSesiones}) 
    }catch(err){
        return res.status(500).json({accion:'getallsesiones', mensaje:'error al listar sesiones:'+err}) 
    } 
}

async function removeSesion(req,res){
    try{
        let sesionBorrado = await Sesion.findOneAndDelete({
            _id: req.params.id,
            empresa: req.user.referencia
        })
        if (!sesionBorrado) throw "Identificador no encontrado"
        return res.status(200).json({accion:'deletesesion', datos: sesionBorrado}) 
    }catch(err){
        console.log("RemoveSesion Error: " + err)
        return res.status(500).json({accion:'deletesesion', mensaje:'error al borrar la sesion'}) 
    } 
}

async function registerOperario(req, res){

    try {
        const { error, value } = await schemaRegisterOperario.validateAsync(req.body)
    }
    catch (err) { 
        console.log("RegisterOperario Error: "+err)
        return res.status(400).json({accion:'registeroperario', mensaje:'error al validar los datos del operario\n' + err})
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();

        let operarioNuevo = new Operario(req.body)

        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: req.user.referencia },
            {$push: {operarios: operarioNuevo}},
            {new:true}).session(session)

        await session.commitTransaction()
        res.status(200).json({accion:'registeroperario', datos: empresaActualizada}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'registeroperario', mensaje:'Error al guardar el operario: '+err}) 
    }finally{
        session.endSession();
    }
    
}

async function removeOperario(req,res){
    try{
        let idOperario = req.params.id;
        let empresaActualizada = await Empresa.findOneAndUpdate(
            {_id: req.user.referencia},
            {
                $pull: {
                    'operarios': {_id: idOperario}
                }
            },
            {new:true})
        if (!empresaActualizada) throw "No se ha actualizado los datos de la empresa"
        return res.status(200).json({accion:'deleteoperario', datos: empresaActualizada}) 
    }catch(err){
        console.log("RemoveOperario Error: " + err)
        return res.status(500).json({accion:'deleteoperario', mensaje:'error al borrar el operario'}) 
    }  
}

async function updateOperario(req,res){
    try {
        const { error, value } = await schemaUpdateOperario.validateAsync(req.body)
    }
    catch (err) {
        return res.status(400).json({accion:'updateoperario', mensaje:'error al validar los datos del operario: '+err})
    }

    try{
        let idOperario = req.params.id
        req.body._id = idOperario
        let empresaActualizada = await Empresa.findOneAndUpdate({
                _id: req.user.referencia,
                "operarios._id": idOperario
            },
            {$set: {"operarios.$": req.body}},
            {new:true});
        if(!empresaActualizada) throw "No se ha actualizado la empresa"
        return res.status(200).json({accion:'updateoperario', datos: empresaActualizada}) 
    }catch(err){
        console.log("UpdateOperario Error: "+err)
        return res.status(500).json({accion:'updateoperario', mensaje:'error al actualizar datos del operario'})
    }
}

async function registerUsuario(req, res){

    try {
        const { error, value } = await schemaRegisterUsuario.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'register', mensaje:'error al validar los datos del usuario: '+err}) 
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();

        let usuarioNuevo = new Usuario(req.body)
        usuarioNuevo.empresa = req.user.referencia
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

async function removeUsuario(req,res){
    try{
        let idUsuario= req.params.id
        let usuario = {estado: "ELIMINADO"}
        let operarioEliminado = await Usuario.findOneAndUpdate({
                _id: idUsuario,
                empresa: req.user.referencia,
                estado: { $ne :"ELIMINADO"}
            },
            usuario, {new:true});
        if(!operarioEliminado) throw "No se ha encontrado usaurio activo"
        return res.status(200).json({accion:'update', datos: operarioEliminado})
    }catch(err){
        return res.status(500).json({accion:'update', mensaje:'error al eliminar el usuario: '+err}) 
    }
}

async function updateUsuario(req,res){
    try {
        const { error, value } = await schemaUpdateUsuario.validateAsync(req.body)
    }
    catch (err) { 
        return res.status(400).json({accion:'update', mensaje:'error al validar los datos del usuario: '+err}) 
    }

    try{
        let idUsuario = req.params.id
        let usuarioActualizado = await Usuario.findOneAndUpdate({
                _id: idUsuario,
                empresa: req.user.referencia
            },
            req.body, {new:true});
        if(!usuarioActualizado) throw "No se ha encontrado usuario"
        return res.status(200).json({accion:'update', datos: usuarioActualizado})
    }catch(err){
        return res.status(500).json({accion:'update', mensaje:'error al actualizar datos del usuario: '+err}) 
    }
}

async function getUsuarios(req,res){
    try{
        let listaUsuarios = await Usuario.find({empresa: req.user.referencia})
        return res.status(200).json({accion:'getall', datos: listaUsuarios}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar usuarios de esta empresa:'+err}) 
    }
   
}

async function getUsuario(req,res){
    try{
        let idUsuario = req.params.id
        console.log(`USUARIO: ${idUsuario} EMPRESA: ${req.user._id}`)
        let usuario = await Usuario.findOne({
            empresa: req.user.referencia,
            _id: idUsuario
        })
        //TODO: Usar projection para recuperar los datos del usuario (sesiones)
        if(!usuario) throw "Usuario no encontrado"
        return res.status(200).json({accion:'getuser', datos: usuario}) 
    }catch(err){
        console.log("getUsuario error: " + err)
        return res.status(500).json({accion:'getuser', mensaje:'error al mostrar este usuario'}) 
    }
}

async function registerBono(req, res){

    try {
        const { error, value } = await schemaRegisterBono.validateAsync(req.body)
    }
    catch (err) { 
        console.log("RegisterBono Error: "+err)
        return res.status(400).json({accion:'registerbono', mensaje:'error al validar los datos del bono'})
    }

    const session = await mongoose.startSession();

    try{
        session.startTransaction();

        let bonoNuevo = new Bono(req.body)
        bonoNuevo.restante = bonoNuevo.valor
        let idUsuario = req.params.id

        /*
        let usuarioActualizado = await Usuario.findOneAndUpdate(
            {_id: idUsuario },
            {$push: {bonos: bonoNuevo}},
            {new:true}).session(session)*/
        let usuarioBuscado = await Usuario.findOne({_id: idUsuario }).session(session)
        if(!usuarioBuscado) throw "No se ha encontrado el usaurio"
        usuarioBuscado.bono = bonoNuevo
        await usuarioBuscado.save()

        await session.commitTransaction()
        res.status(200).json({accion:'registerbono', datos: usuarioBuscado}) 
    }catch(err){
        console.log(err)
        await session.abortTransaction();
        res.status(500).json({accion:'registerbono', mensaje:'Error al guardar el bono: '+err}) 
    }finally{
        session.endSession();
    }
    
}

async function getAllBonos(req,res){
    try{
        let listaBonos = await Usuario.find(
            {
                empresa: req.user.referencia,
                bono: {$exists: true, $ne: null}
            })
        return res.status(200).json({accion:'getallbonos', datos: listaBonos}) 
    }catch(err){
        return res.status(500).json({accion:'getallbonos', mensaje:'error al listar bonos de este usuario:'+err}) 
    }
   
}

async function removeBono(req,res){
    try{
        let idUsuario = req.params.usuario;
        let usuarioActualizado = await Usuario.findOneAndUpdate(
            {_id: idUsuario},
            {bono: null},
            {new:true})
        if (!usuarioActualizado) throw "No se ha eliminado el bono"
        return res.status(200).json({accion:'deletebono', datos: usuarioActualizado}) 
    }catch(err){
        console.log("RemoveBono Error: " + err)
        return res.status(500).json({accion:'deletebono', mensaje:'error al borrar el bono'}) 
    }  
}


/*
async function registerBono(req, res){

    try {
        const { error, value } = await schemaRegisterBono.validateAsync(req.body)
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

async function getAllBonos(req,res){
    try{
        let listaBonos = await Bono.find({
            empresa: req.user.referencia
        })
        return res.status(200).json({accion:'getall', datos: listaBonos}) 
    }catch(err){
        return res.status(500).json({accion:'getall', mensaje:'error al listar bonos de este usuario:'+err}) 
    }
   
}


async function registerOperario(req, res){

    try {
        const { error, value } = await schemaRegisterOperario.validateAsync(req.body)
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

async function removeOperario(req,res){
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

async function updateOperario(req,res){
    try {
        const { error, value } = await schemaUpdateOperario.validateAsync(req.body)
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
} */



/*
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



module.exports = {
    registerEmpresa,
    registerOperario,
    registerSesion,
    registerSolario,
    registerUsuario,
    registerBono,
    registerEstado,
    updateEmpresa,
    updateOperario,
    updateSolario,
    updateUsuario,
    removeEmpresa,
    removeOperario,
    removeSolario,
    removeUsuario,
    removeSesion,
    removeBono,
    getDataEmpresa,
    getAllBonos,
    getSesiones,
    getSesionesUsuario,
    getUsuarios,
    getUsuario
}
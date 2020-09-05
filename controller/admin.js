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
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv'); // Environment config
const bcrypt = require('bcrypt')

dotenv.config();

/*********************************************
* Validaciones de datos
*********************************************/

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
    schemaRegisterBono,
    schemaRegisterLogin,
    schemaLogin
} = require('../schemas/admin')
/*********************************************
 * Funcionalidades implementadas
 *********************************************/


async function login(req, res){
    // Validamos campos
    try {
        const { error, value } = await schemaLogin.validateAsync(req.body)
    }
    catch (err) { 
        console.log('error al validar el login'+err)
        return res.status(401).json({accion:'login', mensaje:'Usuario o contraseña inválidos'})
    }
    
    console.log(
        process.env.ADMINUSER,
        req.body.email,
        process.env.ADMINPWD,
        req.body.password)
    
    // Comprobar que el usuario si existe
    if(process.env.ADMINUSER != req.body.email){ 
        console.log('error al validar el email')
        return res.status(401).json({accion:'login', mensaje:'Usuario o contraseña inválidos'})
    }

    if(process.env.ADMINPWD != req.body.password){ 
        console.log('error al validar el password')
        return res.status(401).json({accion:'login', mensaje:'Usuario o contraseña inválidos'})
    }
    
    // Creamos el token jwt (jsonwebtoken)  Ver web: https://jwt.io/
    const token = jwt.sign( 
        {
            tipo: "ADMINISTRADOR",
            exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hora
        }, 
        process.env.TOKEN_SECRETO )
    res.header('auth-token', token)
        
    res.status(200).send({token, type: "ADMINISTRADOR"})
}

async function getAllUsuarios(req,res){

    try{
        let listaUsuarios = await Usuario.find({})
        return res.status(200).json({accion:'getallUsuarios', datos: listaUsuarios}) 
    }catch(err){
        console.log("getallUsuarios ERROR: "+ err)
        return res.status(500).json({accion:'getallUsuarios', mensaje:'error al listar todas los usuarios:'+err}) 
    }
}
        
async function getAllEmpresas(req,res){

    try{
        let listaEmpresas = await Empresa.find({})
        return res.status(200).json({accion:'getallEmpresas', datos: listaEmpresas}) 
    }catch(err){
        console.log("getallEmpresas ERROR: "+ err)
        return res.status(500).json({accion:'getallEmpresas', mensaje:'error al listar todas las empresas:'+err}) 
    }
}

async function getAllLogins(req,res){

    try{
        let listaLogins = await Login.find({})
        return res.status(200).json({accion:'getallLogin', datos: listaLogins}) 
    }catch(err){
        console.log("GetAllLogin ERROR: "+ err)
        return res.status(500).json({accion:'getallLogin', mensaje:'Error al listar todos los login:'+err}) 
    }
}

async function getAllSesiones(req,res){

    try{
        let listaSesiones = await Sesion.find({})
        return res.status(200).json({accion:'getallsesiones', datos: listaSesiones}) 
    }catch(err){
        console.log("GgetAllSesiones ERROR: "+ err)
        return res.status(500).json({accion:'getallsesiones', mensaje:'Error al listar todas las sesiones:'+err}) 
    }
}


async function deleteEmpresa(req,res){
    try{
        let idEmpresa = req.params.id
console.log("INTENTO ELIMINAR EMPRESA"); 
let empresaEliminada = "Tu_Empresa";
/**
        let empresaEliminada = await Empresa.findOneAndDelete({_id: idEmpresa})
        if(!empresaEliminada) throw "No se ha podido eliminar la empresa"
**/
        return res.status(200).json({accion:'delete', datos: empresaEliminada})
    }catch(err){
        console.log( "ERROR: " +err) 
        return res.status(500).json({accion:'delete', mensaje:'error al eliminar la empresa'})
    }
}

async function deleteUsusario(req,res){
    try{
        let idUsuario = req.params.id

        let usuarioEliminado = await Usuario.findOneAndDelete({_id: idUsuario})
        if(!usuarioEliminado) throw "No se ha podido eliminar el usuario"
        return res.status(200).json({accion:'delete', datos: usuarioEliminado})
    }catch(err){
        console.log( "ERROR: " +err) 
        return res.status(500).json({accion:'delete', mensaje:'error al eliminar el usuario'})
    }
}

async function deleteSesion(req,res){
    try{
        let idSesion = req.params.id

        let sesionEliminada = await Sesion.findOneAndDelete({_id: idSesion})
        if(!sesionEliminada) throw "No se ha podido eliminar la sesion"
        return res.status(200).json({accion:'delete', datos: sesionEliminada})
    }catch(err){
        console.log( "ERROR: " +err) 
        return res.status(500).json({accion:'delete', mensaje:'error al eliminar la sesion'})
    }
}

async function deleteSolario(req,res){
    try{
        let idSolario = req.params.id

        let solarioEliminado = await Sesion.findOneAndDelete({_id: idSolario})
        if(!solarioEliminado) throw "No se ha podido eliminar el solario"
        return res.status(200).json({accion:'delete', datos: solarioEliminado})
    }catch(err){
        console.log( "ERROR: " +err) 
        return res.status(500).json({accion:'delete', mensaje:'error al eliminar el solario'})
    }
}

async function deleteLogin(req,res){
    try{
        let idLogin = req.params.id

        let loginEliminado = await Login.findOneAndDelete({_id: idLogin})
        if(!loginEliminado) throw "No se ha podido eliminar el login"
        return res.status(200).json({accion:'delete', datos: loginEliminado})
    }catch(err){
        console.log( "ERROR: " +err) 
        return res.status(500).json({accion:'delete', mensaje:'error al eliminar el login'})
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
 

 async function registerLogin(req, res){
    try {
         const { error, value } = await schemaRegisterLogin.validateAsync(req.body)
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
         return res.status(400).json({accion:'register', mensaje:'Error en los datos de Login. Ya existe'}) 
     }
 
    
     // Creamos el hash del password (nunca debemos guardar el password en texto claro)
     const salt = await bcrypt.genSalt(10)
     const hashPassword = await bcrypt.hash(req.body.password, salt)
 
     const loginDoc = new Login({
         email: req.body.email,
         password: hashPassword,
         tipo: req.body.tipo
     })
     
     try{
         let loginGuardado = await loginDoc.save({upsert:false})
         if(!loginGuardado) throw "No se ha guardado"
         res.status(200).json({accion:'registerlogin', datos: loginGuardado}) 
     }catch(err){
         res.status(500).json({accion:'registerlogin', mensaje:'error al guardar los datos de login. Cancelado'}) 
     }
 
 }


module.exports = {
    login,
    getAllEmpresas,
    getAllUsuarios,
    getAllSesiones,
    getAllLogins,
    deleteSesion,
    deleteUsusario,
    deleteEmpresa,
    deleteLogin,
    deleteSolario,
    registerEmpresa,
    registerLogin
}
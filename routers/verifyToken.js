const jwt = require('jsonwebtoken')
/*
exports.auth = (req,res,next) => {
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        req.user = verificado
        console.log(verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send(denegado)
    }
    next();
}
*/

const denegado = {accion: "login", mensaje: 'Acceso denegado'}

function authEmpresa(req,res,next){
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        if(verificado.tipo != "EMPRESA") throw "Usuario no autorizado"
        req.user = verificado
        //console.log(verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send(denegado)
    }
    next();
}

function authUsuario(req,res,next){
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        if(verificado.tipo != "USUARIO") throw "Usuario no autorizado"
        req.user = verificado
        console.log(verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send(denegado)
    }
    next();
}

function authGestor(req,res,next){
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        if(verificado.tipo != "GESTOR") throw "Usuario no autorizado"
        req.user = verificado
        console.log(verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send(denegado)
    }
    next();
}

function authAdministrador(req,res,next){
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        if(verificado.tipo != "ADMINISTRADOR") throw "Usuario no autorizado"
        req.user = verificado
        console.log("ADMIN: "+verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send(denegado)
    }
    next();
}

function auth(req,res,next){
    return res.status(401).send('REFACTORIZADO')
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        if(verificado.tipo != "EMPRESA") throw "Usuario no autorizado"
        req.user = verificado
        console.log(verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send(denegado)
    }
    next();
}

module.exports = { authEmpresa, authUsuario, authGestor, authAdministrador, auth}
const jwt = require('jsonwebtoken')

exports.auth = (req,res,next) => {
    try{
        const token = req.header('auth-token');
        if(!token) throw "Token no disponible"
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        req.user = verificado
        console.log(verificado)
    }catch(err){
        console.log("Acceso denegago: "+err)
        return res.status(401).send('Acceso denegado')
    }
    next();
}

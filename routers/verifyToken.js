const jwt = require('jsonwebtoken')

exports.auth = (req,res,next) => {
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Acceso denegado')

    try{
        console.log(token)
        console.log(process.env.TOKEN_SECRETO)
        const verificado = jwt.verify(token, process.env.TOKEN_SECRETO)
        req.user = verificado
        console.log(verificado)
    }catch(err){
        return res.status(400).send('Token invalido:'+err)
    }
    next();
}

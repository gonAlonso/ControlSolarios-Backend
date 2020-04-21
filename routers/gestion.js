var express = require('express');
var router = express.Router();
var controller = require('../controller/gestion')
var verify = require('./verifyToken')


//router.put('/login', controller.login)
//router.post('/', verify.authGestor, controller.register)
router.put('/empresa/:id', verify.authGestor, controller.activar)
router.delete('/empresa/:idempresa', verify.authGestor, controller.remove)
router.get('/empresas', verify.authGestor, controller.getAllEmpresas)
router.get('/usuarios', verify.authGestor, controller.getAllUsuarios)

module.exports = router;
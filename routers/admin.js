var express = require('express');
var router = express.Router();
var controller = require('../controller/admin')
var verify = require('./verifyToken')


router.post('/login', controller.login)
router.get('/empresas', verify.authAdministrador, controller.getAllEmpresas)
//router.post('/gestor', verify.authAdministrador, controller.registerGestor)
//router.put('/gestor/:id', verify.authGestor, controller.activar)
//router.delete('/empresa/:idempresa', verify.authGestor, controller.remove)
//router.get('/usuarios', verify.authGestor, controller.getAllUsuarios)

module.exports = router;
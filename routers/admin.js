var express = require('express');
var router = express.Router();
var controller = require('../controller/admin')
var verify = require('./verifyToken')


router.get('/login', verify.authAdministrador, controller.getAllLogins)
router.get('/empresas', verify.authAdministrador, controller.getAllEmpresas)
router.get('/usuarios', verify.authAdministrador, controller.getAllUsuarios)
router.get('/sesiones', verify.authAdministrador, controller.getAllSesiones)

router.post('/dologin', controller.login)
router.post('/login', verify.authAdministrador, controller.registerLogin)
router.post('/empresa', verify.authAdministrador, controller.registerEmpresa)
//router.post('/usuario', verify.authAdministrador, controller.registerUsuario)
//router.post('/sesion', verify.authAdministrador, controller.registerSesion)


router.delete('/login/:id', verify.authAdministrador, controller.deleteLogin)
router.delete('/empresa/:id', verify.authAdministrador, controller.deleteEmpresa)
router.delete('/usuario/:id', verify.authAdministrador, controller.deleteUsusario)
router.delete('/sesion/:id', verify.authAdministrador, controller.deleteSesion)
router.delete('/solario/:id', verify.authAdministrador, controller.deleteSolario)

//router.post('/gestor', verify.authAdministrador, controller.registerGestor)
//router.put('/gestor/:id', verify.authGestor, controller.activar)
//router.delete('/empresa/:idempresa', verify.authGestor, controller.remove)
//router.get('/usuarios', verify.authGestor, controller.getAllUsuarios)

module.exports = router;
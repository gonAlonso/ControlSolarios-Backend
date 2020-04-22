var express = require('express');
var router = express.Router();
var controller = require('../controller/empresa')
var verify = require('./verifyToken')


//router.post('/login', controller.login)
router.post('/register', controller.registerEmpresa)
router.post('/operario', verify.authEmpresa, controller.registerOperario)
router.post('/sesion/:user', verify.authEmpresa, controller.registerSesion)
router.post('/solario', verify.authEmpresa, controller.registerSolario)
router.post('/usuario', verify.authEmpresa, controller.registerUsuario)
router.post('/bono/:id', verify.authEmpresa, controller.registerBono)
router.post('/estado/', verify.authEmpresa, controller.registerEstado)

router.put('/update', verify.authEmpresa, controller.updateEmpresa)
router.put('/operario/:id', verify.authEmpresa, controller.updateOperario)
router.put('/solario/:id', verify.authEmpresa, controller.updateSolario)
router.put('/usuario/:id', verify.authEmpresa, controller.updateUsuario)

router.delete('/delete', verify.authEmpresa, controller.removeEmpresa)
router.delete('/sesion/:id', verify.authEmpresa, controller.removeSesion)
router.delete('/operario/:id', verify.authEmpresa, controller.removeSesion)
router.delete('/solario/:id', verify.authEmpresa, controller.removeSolario)
router.delete('/usuario/:id', verify.authEmpresa, controller.removeUsuario)
router.delete('/bono/:usuario', verify.authEmpresa, controller.removeBono)

router.get('/', verify.authEmpresa, controller.getDataEmpresa)
router.get('/sesiones', verify.authEmpresa, controller.getSesiones)
router.get('/sesion/:user', verify.authEmpresa, controller.getSesionesUsuario)
router.get('/usuario/:id', verify.authEmpresa, controller.getUsuario)
router.get('/usuarios', verify.authEmpresa, controller.getUsuarios)
router.get('/bonos', verify.authEmpresa, controller.getAllBonos)

//router.get('/operarios', verify.authEmpresa, controller.getOperarios)
//router.get('/solarios', verify.authEmpresa, controller.getSolarios)


module.exports = router;

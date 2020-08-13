var express = require('express');
var router = express.Router();
var controller = require('../controller/gestion')
var verify = require('./verifyToken')

router.get('/empresa', verify.authGestor, controller.getAllEmpresas)

router.put('/activarempresa/:id', verify.authGestor, controller.activarEmpresa)
router.put('/desactivarempresa/:id', verify.authGestor, controller.desactivarEmpresa)
router.put('/impagoempresa/:id', verify.authGestor, controller.impagoEmpresa)

//router.put('/login', controller.login)
//router.post('/', verify.authGestor, controller.register)
//router.delete('/empresa/:idempresa', verify.authGestor, controller.remove)
//router.get('/usuarios', verify.authGestor, controller.getAllUsuarios)

module.exports = router;
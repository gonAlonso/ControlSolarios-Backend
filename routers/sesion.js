var express = require('express');
var router = express.Router();
var controller = require('../controller/sesion')
var verify = require('./verifyToken')


router.post('/:user/:bono?', verify.auth, controller.register)
router.delete('/:id', verify.auth, controller.remove)
router.get('/', verify.auth, controller.getAll)
router.get('/:user', verify.auth, controller.getUsuario)
//router.put('/:user/:bono?', verify.auth, controller.update)

module.exports = router;
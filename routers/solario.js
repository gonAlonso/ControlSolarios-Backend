var express = require('express');
var router = express.Router();
var controller = require('../controller/solario')
var verify = require('./verifyToken')


router.post('/', verify.auth, controller.register)
router.put('/:id', verify.auth, controller.update)
router.delete('/:id', verify.auth, controller.remove)
router.get('/', verify.auth, controller.getAll)
//router.get('/:id', controller.getById)
//router.post('/', controller.insert)

//router.get('/:id/puntuacion', controller.getPuntuacionesUsuario)
//router.post('/:id/puntuacion', controller.insertPuntuacion)

module.exports = router;
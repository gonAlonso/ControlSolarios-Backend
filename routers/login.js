var express = require('express');
var router = express.Router();
var controller = require('../controller/empresa')
var verify = require('./verifyToken')


router.post('/login', controller.login)
router.post('/register', controller.register)
router.put('/', verify.auth, controller.update)
router.get('/', verify.auth, controller.getData)
//router.get('/:id', controller.getById)
//router.post('/', controller.insert)
//router.delete('/:id', controller.remove)

//router.get('/:id/puntuacion', controller.getPuntuacionesUsuario)
//router.post('/:id/puntuacion', controller.insertPuntuacion)

module.exports = router;
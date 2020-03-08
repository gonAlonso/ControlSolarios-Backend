var express = require('express');
var router = express.Router();
var controller = require('../controller/usuario')
var verify = require('./verifyToken')

router.get('/',  controller.getAll)
router.get('/:id', controller.getById)
//router.post('/', controller.insert)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.delete('/:id', controller.remove)
router.put('/:id', controller.update)

router.get('/:id/puntuacion', controller.getPuntuacionesUsuario)
router.post('/:id/puntuacion', controller.insertPuntuacion)

module.exports = router;
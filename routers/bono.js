var express = require('express');
var router = express.Router();
var controller = require('../controller/bono')
var verify = require('./verifyToken')


router.post('/:id', verify.auth, controller.register)
router.put('/:id', verify.auth, controller.update)
router.get('/', verify.auth, controller.getAll)
router.get('/:id', verify.auth, controller.getUsuario)
//router.delete('/:id', verify.auth, controller.cancel)

module.exports = router;
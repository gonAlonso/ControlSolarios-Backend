var express = require('express');
var router = express.Router();
var controller = require('../controller/usuario')
var verify = require('./verifyToken')


router.put('/login', controller.login)
router.post('/', verify.auth, controller.register)
router.delete('/:id', verify.auth, controller.remove)
router.get('/', verify.auth, controller.getAll)

module.exports = router;
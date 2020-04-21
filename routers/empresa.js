var express = require('express');
var router = express.Router();
var controller = require('../controller/empresa')
var verify = require('./verifyToken')


//router.post('/login', controller.login)
router.post('/register', controller.register)
router.post('/remove', verify.authEmpresa, controller.remove)
router.put('/', verify.authEmpresa, controller.update)
router.get('/', verify.authEmpresa, controller.getData)
//router.put('/', verify.auth, controller.update)
//router.get('/', verify.auth, controller.getData)

module.exports = router;
var express = require('express');
var router = express.Router();
var controller = require('../controller/login')
//var verify = require('./verifyToken')


router.post('/login', controller.login)
router.get('/:token', controller.verifyLogin)
//router.post('/loginadmin', controller.loginadmin)

module.exports = router;
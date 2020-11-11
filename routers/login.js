var express = require('express');
var router = express.Router();
var controller = require('../controller/login')
//var verify = require('./verifyToken')


router.post('/', controller.login)
router.get('/:token', controller.verifyLogin)
//router.post('/loginadmin', controller.loginadmin)

module.exports = router;
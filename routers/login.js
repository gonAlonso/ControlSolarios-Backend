var express = require('express');
var router = express.Router();
var controller = require('../controller/empresa')
var verify = require('./verifyToken')


router.post('/login', controller.login)

module.exports = router;
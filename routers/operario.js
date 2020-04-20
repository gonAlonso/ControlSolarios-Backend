var express = require('express');
var router = express.Router();
var controller = require('../controller/operario')
var verify = require('./verifyToken')


router.post('/', verify.auth, controller.register)
router.put('/:id', verify.auth, controller.update)
router.delete('/:id', verify.auth, controller.remove)
router.get('/', verify.auth, controller.getAll)

module.exports = router;
var express = require('express');
var router = express.Router();

var index = require('./index');
var login = require('./login');

router.get('/', index.index);
router.get('/touch', index.touch);
router.get('/login', login.login);
module.exports = router;
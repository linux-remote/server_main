var express = require('express');
var router = express.Router();

var index = require('./index');

router.get('/', index.index);

module.exports = router;
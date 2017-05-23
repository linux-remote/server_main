var express = require('express');
var router = express.Router();

var index = require('./index');

router.get('/', index.index);
router.get('/touch', index.touch);
module.exports = router;
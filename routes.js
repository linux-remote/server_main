var express = require('express');
var router = express.Router();
var api = require('./api');

/* GET users listing. */
router.get('/', api);

module.exports = router;

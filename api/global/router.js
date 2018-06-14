const express = require('express');
const router = express.Router();

const time = require('./time');
const thirdPartyApp = require('./third-party-app');

router.use('/app', thirdPartyApp.router);

router.get('/time', time);


module.exports = router;

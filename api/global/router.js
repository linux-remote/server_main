const express = require('express');
const router = express.Router();

const index = require('./index');

const thirdPartyApp = require('./third-party-app');

router.use('/app', thirdPartyApp);

router.get('/time', index.time);


module.exports = router;

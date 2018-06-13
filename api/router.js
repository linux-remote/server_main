const express = require('express');
const router = express.Router();

const index = require('./index');
const _app = require('./third-party-app');

router.get('/touch', index.touch);

router.use('/app', _app.router);

router.get('/time', index.time);


module.exports = router;

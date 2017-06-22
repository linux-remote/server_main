const express = require('express');
const router = express.Router();
const index = require('./index');
const login = require('./login');
const CA = require('./first-download-ca');

router.post('/verifyDownloadCACert', CA.verify);
router.get('/getDownloadCACertStatus', CA.getStatus);
router.get('/downloadCACert/:key', CA.download);

router.get('/touch', index.touch);

router.get('/time', index.time);

router.post('/login', login.login);
router.post('/logout', login.logout);

module.exports = router;

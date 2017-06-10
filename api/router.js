const express = require('express');
const router = express.Router();
const index = require('./index');
const login = require('./login');
const user = require('./user');
const CA = require('./first-download-ca');

router.post('/verifyDownloadCACert', CA.verify);
router.get('/getDownloadCACertStatus', CA.getStatus);
router.get('/downloadCACert/:key', CA.download);

router.get('/touch', index.touch);

router.post('/login', login.login);
router.post('/logout', login.logout);

router.use('/user/:username', user.proxy);

module.exports = router;

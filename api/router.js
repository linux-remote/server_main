const express = require('express');
const router = express.Router();
const index = require('./index');
const login = require('./login');
const _app = require('./frout-end-app');

router.get('/touch', index.touch);

router.use('/app', _app);

router.get('/time', index.time);

router.post('/login', login.login);
router.post('/logout', login.logout);

module.exports = router;

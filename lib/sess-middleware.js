const session = require('express-session');
const SessStore = require('./fs-session-store')(session);
const CONF = global.CONF;
module.exports = session({
  secret: CONF.sessionSecret,
  name: 'main_sid',
  cookie: {
    //path: '/api',
    httpOnly: true
  },
  store: new SessStore({
    dir: CONF.TMP_PATH
  }),
  resave: true,
  saveUninitialized: true
})

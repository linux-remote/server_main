const session = require('express-session');
const SessStore = require('./fs-session-store')(session);
module.exports = session({
  secret: global.CONF.sessionSecret,
  name: 'main_sid',
  cookie: {
    //path: '/api',
    httpOnly: true
  },
  store: new SessStore({
    dir: global.SESSION_PATH
  }),
  resave: true,
  saveUninitialized: true
})

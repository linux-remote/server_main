const session = require('express-session');
const { Store, ensureUniqueId } = require('./money-store');
const SessStore = Store(session);
const store = new SessStore();
const sessMiddleware = session({
  secret: global.CONF.sessionSecret,
  name: 'sid',
  genid: ensureUniqueId,
  cookie: {
    path: '/api',
    httpOnly: true
  },
  store,
  resave: true,
  saveUninitialized: true
});

module.exports = sessMiddleware;

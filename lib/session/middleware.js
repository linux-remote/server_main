const session = require('express-session');
const { Store, ensureUniqueId } = require('./money-store');
const SessStore = Store(session);
const store = new SessStore();
const cookieOpts = {
  path: '/api',
  httpOnly: true
};
if(global.CONF.sessionCookieSameSite !== undefined){
  cookieOpts.sameSite = global.CONF.sessionCookieSameSite;
}
if(global.CONF.sessionCookieSecure !== undefined){
  cookieOpts.secure = global.CONF.sessionCookieSecure;
}
const sessMiddleware = session({
  secret: global.CONF.sessionSecret,
  name: 'sid',
  genid: ensureUniqueId,
  cookie: cookieOpts,
  store,
  resave: true,
  saveUninitialized: true,
  proxy: global.CONF.sessionProxy
});

module.exports = sessMiddleware;

const session = require('express-session');
const SessStore = require('./fs-session-store')(session);
const {ensureUniqueId} = require('../common/util');


//https://stackoverflow.com/questions/23327010/how-to-generate-unique-id-with-node-js
const generateId = ensureUniqueId(global.SESSION_PATH);

module.exports = session({
  secret: global.CONF.sessionSecret,
  name: 'main_sid',
  genid: generateId,
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

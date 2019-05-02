const session = require('express-session');
const { Store, ensureUniqueId } = require('./money-store');
const SessStore = Store(session);
const store = new SessStore();
const userTerms = require('./user-terms');
const fsClear = require('./fs-clear');

fsClear.clearAll(global.SESSION_PATH);

store.on('sessionTTLClear', function(sid) {
  userTerms.clearBySid(sid);
  fsClear.clearOnTTL(global.SESSION_PATH, sid, function(err){
    if(err){
      console.error('fs clear tmp files error.');
      throw err;
    }
  });
});

module.exports = session({
  secret: global.CONF.sessionSecret,
  name: 'sid',
  genid: ensureUniqueId,
  cookie: {
    //path: '/api',
    httpOnly: true
  },
  store,
  resave: true,
  saveUninitialized: true
})

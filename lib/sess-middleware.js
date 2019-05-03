const session = require('express-session');
const SessStore = require('./fs-session-store')(session);

const uid = require('uid-safe');
const fs = require('fs');
const path = require('path');

function ensureUniqueId(filePath){
  return function generateId() {
    var id = uid.sync(24);
    try{ 
      fs.statSync(path.join(filePath, id))
    } catch(e) {
      if(e.code === 'ENOENT'){
        return id;
      }
      console.error('sess middleware generateId fail.')
      throw e
    }
    return generateId()
  }
}

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

const http = require('http');
const https = require('https');
const path = require('path');
const os = require('os');

const { initSecure } = require('./lib/secure');

function def(obj, key, value){
  if(obj[key] === undefined){
    obj[key] = value;
  }
}
global.__HOME_DIR__ = os.userInfo().homedir;
const confPath = global.IS_PRO ? 
  path.join(global.__HOME_DIR__, 'config.js') : 
  path.join(__dirname, '../dev.config.js');

// function createServer(){
const conf = require(confPath);
global.CONF = conf;
if(conf.appTrustProxy === true){
  process.send({type: 'exit', data: "can't set appTrustProxy true."});
  return;
}
conf.CORS = typeof conf.client === 'string' ? conf.client : null;

def(conf, 'appTrustProxy', false);
def(conf, 'cookie', Object.create(null));
const app = require('./app');

app.set('port', conf.port);

let server;
const secure = conf.secure;
if(conf.secure){
  let errMsg = initSecure(conf.secure);
  if(errMsg){
    console.error(errMsg);
    process.send({
      type: 'exit',
      message: errMsg
    });
    return;
  }

  server = https.createServer(secure, app);
  
}else{
  server = http.createServer(app);
}

server.listen(conf.port);

server.on('listening', function(){
  console.info('[server]: Server start!');
  console.info('Listening on ' + conf.port);
  console.info('NODE_ENV ' + process.env.NODE_ENV);
  process.send({type: 'serverListened'});
});

server.on('error', function(err){
  let errMsg;
  if (err.code === 'EADDRINUSE') {
    errMsg = 'port ' + conf.port + ' is already in use.';
  } else {
    errMsg = err.name + ': ' + err.message;
  }
  process.send({
    type: 'exit',
    message: errMsg
  });
});

module.exports = server;

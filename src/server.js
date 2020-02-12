const http = require('http');
const https = require('https');
const path = require('path');
const os = require('os');

require('./lib/post-json')(http);
const { initSecure } = require('./lib/secure');

function def(obj, key, value){
  if(obj[key] === undefined){
    obj[key] = value;
  }
}

const confPath = global.IS_PRO ? 
  path.join(os.userInfo().homedir, 'config.js') : 
  path.join(__dirname, '../dev.config.js');

// function createServer(){
const conf = require(confPath);
global.CONF = conf;


def(conf, 'xPoweredBy', false);
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
    process.exit(1);
  }

  server = https.createServer(secure, app);
  
}else{
  server = http.createServer(app);
}

server.listen(conf.port);

server.on('listening', function(){
  console.log('[server]: Server start!');
  console.log('Listening on ' + conf.port);
  console.log('NODE_ENV ' + process.env.NODE_ENV);
});

server.on('error', function(err){
  if (err.code === 'EADDRINUSE') {
    console.error('port ' + conf.port + ' is already in use.');
    process.exit(1);
  }
  throw err;
});

module.exports = server;

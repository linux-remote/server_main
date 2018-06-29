// Entry
const http = require('http');
const https = require('https');
const exec = require('child_process').exec;
const os = require('os');
const path = require('path');

try{
  global.SESSION_PATH = '/dev/shm/linux-remote';
  exec('mkdir -m=1777 -p ' + global.SESSION_PATH);
}catch(e){
  global.SESSION_PATH = path.join(os.tmpdir(), 'linux-remote');
  exec('mkdir -m=1777 -p ' + global.SESSION_PATH);
}

//const {fork} = require('child_process');
const NODE_ENV = process.env.NODE_ENV;

const { onListening, 
      onError, 
      normalizePort } = require('./common/util');

const conf = require('./conf/dev.js');


module.exports = function(userConf){

  Object.assign(conf, userConf);

  global.IS_PRO = NODE_ENV === 'production';
  global.CONF = conf;

  
  //const createWebSocketServer = require('./web-socket-server');
  const app = require('./app');

  const port = normalizePort(process.env.PORT || conf.port);
  app.set('port', port);

  var server;
  if(conf.ssl){
    server = https.createServer(conf.ssl, app);
  }else{
    server = http.createServer(app);
  }
  
  
  server.listen(port);
  server.on('error', onError(port));
  server.on('listening', onListening(server, () => {
    console.log('linux remote server start!\n');
  }));
  // global.CALLBACK_SERVER = fork('./callback-server.js');
  // global.WEB_SOCKET_SERVER = createWebSocketServer(server);
}
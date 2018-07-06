// Entry
const http = require('http');
const https = require('https');
const {execSync} = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
try{
  global.SESSION_PATH = '/dev/shm/linux-remote';
  execSync('mkdir -m=1777 -p ' + global.SESSION_PATH);
}catch(e){
  global.SESSION_PATH = path.join(os.tmpdir(), 'linux-remote');
  execSync('mkdir -m=1777 -p ' + global.SESSION_PATH);
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

  
  const createWebSocketServer = require('./web-socket-server');
  const app = require('./app');

  const port = normalizePort(process.env.PORT || conf.port);
  app.set('port', port);

  var server;
  if(conf.ssl){
    server = https.createServer({
      key: fs.readFileSync(conf.ssl.key, 'utf-8'),
      cert: fs.readFileSync(conf.ssl.cert, 'utf-8')
    }, app);
  }else{
    server = http.createServer(app);
  }
  
  
  server.listen(port);
  server.on('error', onError(port));
  server.on('listening', onListening(server, () => {
    console.log('linux remote server start!\n');
  }));
  // global.CALLBACK_SERVER = fork('./callback-server.js', {
  //   env: {
  //     PORT: path.join(path.dirname(global.SESSION_PATH), 'linux-remote-callback.sock')
  //   }
  // });
  global.WEB_SOCKET_SERVER = createWebSocketServer(server);
}
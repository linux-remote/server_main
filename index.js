// Entry
const http = require('http');
const https = require('https');

const NODE_ENV = process.env.NODE_ENV;

const { onListening, 
      onError, 
      normalizePort } = require('./common/util');

const conf = require('./conf/dev.js');


module.exports = function(userConf){

  Object.assign(conf, userConf);

  global.IS_PRO = NODE_ENV === 'production';
  global.SESSION_PATH = '/opt/linux-remote/session';
  global.CONF = conf;

  //定期删除过期的用户 session 和用户 log
  require('./lib/ttl');
  
  const createWebSocketServer = require('./web-socket-server');
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

  createWebSocketServer(server);
}
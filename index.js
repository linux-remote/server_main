// Entry
const http = require('http');
const https = require('https');
const fs = require('fs');

if(process.getuid() !== 0){
  console.error('linux-remote server must start-up by root user');
  process.exit();
}



//const {fork} = require('child_process');
const NODE_ENV = process.env.NODE_ENV;

const { onListening, 
  onError, 
  normalizePort } = require('./common/util');




module.exports = function(userConf){
  
  require('./lib/init-session-path');

  const conf = {
    port: 3000,
    sessionSecret: 'devSessionSecret',
    sshPort: 22
  };
  
  Object.assign(conf, userConf);

  global.IS_PRO = NODE_ENV === 'production';
  global.CONF = conf;

  
  // const createWebSocketServer = require('./web-socket-server');
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

  const handleServerUpgrade = require('./ws-server');
  handleServerUpgrade(server);
  
  return app;

}
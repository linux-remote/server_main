// Entry

const http = require('http');
const https = require('https');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const NODE_ENV = process.env.NODE_ENV;
const { onListening, 
      onError, 
      normalizePort } = require('./common/util');

const conf = require('./conf/def.js');

module.exports = function(userConf){

  Object.assign(conf, userConf);
  // 2定义全局变量
  global.IS_PRO = NODE_ENV === 'production';
  global.SESSION_PATH = '/opt/linux-remote/ttl';


  Object.assign(conf, COM_CONST);

  global.CONF = conf;
  // 3初始化

    if(err) throw err;


    require('./lib/tmp-ttl');
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

    const createWebSocketServer = require('./web-socket-server');
    createWebSocketServer(server);



}
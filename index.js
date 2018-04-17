// 此文件为入口文件，主要作用为：初始化并启动服务器，listen端口。
const http = require('http');
const https = require('https');
const _ = require('lodash');
const { execSync } = require('child_process');

const I = execSync('whoami').toString().trim();

// 1判定是否是root登录
if(I !== 'root'){
  throw new Error('linux-remote needs sudo start-up!');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';


const NODE_ENV = process.env.NODE_ENV;
const {onListening, onError, normalizePort} = require('./common/util');
const COM_CONST = require('./common/const');
var conf = require('./conf/' + NODE_ENV);

function index(userConf){

  conf = _.merge(conf, userConf); //?用不用深度merge

  // 2定义全局变量
  global.IS_PRO = NODE_ENV === 'production';
  global.ROOT_PATH = __dirname;
  conf.NODE_ENV = NODE_ENV;

  Object.assign(conf, COM_CONST);

  conf.NODE_ENV = NODE_ENV;
  global.CONF = conf;

  const init = require('./lib/init');

  // 3初始化
  init(function(err, result){
    if(err) throw err;
    global.CONF.sessionSecret = result.sessionSecret;

    require('./lib/tmp-ttl');
    const app = require('./app');
    const port = normalizePort(process.env.PORT || conf.port);
    app.set('port', port);

    var server;

    if(conf.ssl){
      server = https.createServer(result.ssl, app);
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

  });

}


module.exports = index;

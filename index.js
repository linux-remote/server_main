
// 当一个前端买了一台linux服务器，一场战斗打响了。
// 此文件为入口文件，主要作用为：初始化并启动服务器，listen端口。
var execSync = require('child_process').execSync;
const I = execSync('whoami').toString().trim();

// 1判定是否是root登录
if(I !== 'root'){
  throw new Error('linux-remote needs sudo start-up!');
}

var http = require('http');
var https = require('https');
var sas = require('sas');
var _ = require('lodash');
var NODE_ENV = process.env.NODE_ENV || 'development';
var {onListening, onError, normalizePort} = require('./common/server-util');

var conf = require('./conf/' + NODE_ENV);

function index(userConf){

  conf = _.merge(conf, userConf); //?用不用深度merge

  // 2定义全局变量
  global.IS_PRO = NODE_ENV === 'production';
  global.ROOT_PATH = __dirname;
  conf.NODE_ENV = NODE_ENV;
  conf.DATA_FOLDER_NAME = '.linux-remote-data';
  conf.DATA_PATH = `/root/${conf.DATA_FOLDER_NAME}`;
  conf.TMP_PATH = '/var/tmp/linux-remote';
  conf.NODE_ENV = NODE_ENV;
  global.CONF = conf;

  var init = require('./lib/init');

  // 3初始化
  init(function(err, result){
    if(err) throw err;

    var app = require('./app');
    var port = normalizePort(process.env.PORT || conf.port);
    app.set('port', port);

    var server;

    if(conf.ssl){
      server = https.createServer(result.ssl, app);
    }else{
      server = http.createServer(app);
    }

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening(server));
  });

}


module.exports = index;


// 当一个前端买了一台linux服务器，一场战斗打响了。
// 此文件为入口文件，主要作用为：初始化并启动服务器，listen端口。

var http = require('http');
var https = require('https');

var sas = require('sas');
var _ = require('lodash');

var NODE_ENV = process.env.NODE_ENV || 'development';
var conf = require('./conf/' + NODE_ENV);

var server;


function index(userConf){

  conf = _.merge(conf, userConf); //?用不用深度merge

  global.IS_PRO = NODE_ENV === 'production';
  global.ROOT_PATH = __dirname;

  conf.NODE_ENV = NODE_ENV;
  conf.DATA_FOLDER_NAME = 'linux-remote-data';
  conf.DATA_PATH = `/opt/${conf.DATA_FOLDER_NAME}`;

  global.CONF = conf;
  global.CONF.NODE_ENV = NODE_ENV;
  
  
  var init = require('./lib/init');
  
  init(function(err, result){
    if(err) throw err;

    var app = require('./app');

    var port = normalizePort(process.env.PORT || conf.port);
    app.set('port', port);

    if(conf.ssl){
      server = https.createServer(result.ssl, app);
    }else{
      server = http.createServer(app);
    }

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

  });

}


module.exports = index;

//*******************************************************************************/
//The following is copy and modify from express-generator's bin/www file.
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
  console.log('NODE_ENV ' + process.env.NODE_ENV);
}

var http = require('http');
var https = require('https');
var sas = require('sas');


var NODE_ENV = process.env.NODE_ENV || 'development';
var conf = require('./conf/' + NODE_ENV);

var app = require('./app');
var ssl = require('./local_modules/ssl-cert-generator');


function createServer(callback){
  if(conf.https){
    ssl(function(err){
      if(err){
        console.log('error', err)
      }
      this.server = https.createServer({key: this.key, cert: this.cert}, app);
      callback();
    })
    
  }else{
    this.server = http.createServer(app);
    callback();
  }

}


function listen(callback){
  var server = this.server;
  server.listen(process.env.PORT || conf.port);
  server.on('error', onError);
  server.on('listening', onListening);
}


module.exports = function(userConf){

  conf = Object.assign(conf, userConf);

  global.IS_PRO = NODE_ENV === 'production';
  global.ROOT_PATH = __dirname;
  global.CONF = conf;
  sas([createServer, listen]);

}



// copy by express-generator 
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
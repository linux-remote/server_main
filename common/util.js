function getClientIp(req){
  return req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
}

const codeMap = {
  1: '参数不正确。',
  2: '未登录。',
  3: 'CACertFirstDownloadKey不正确。',
  4: 'CACertFirstDownloadKey已经用过一次了。',
  5: 'session 失效了'
}

exports.codeErrWrap = function(code, msg = ''){
  var err = new Error(codeMap[code] +  msg);
  err.isCodeError = true;
  err.code = code;
  return err;
}

exports.errLog = function(errMsg, req){
  console.error(
    '\n<errorLog>'
    + '\n' + errMsg
    + '\n method ' + req.method
    + '\n host ' + req.headers.host
    + '\n originalUrl ' + req.originalUrl
    + '\n UA ' + req.headers['user-agent']
    + '\n IP ' + getClientIp(req)
    + '\n time ' + Date()
    + '\n </errorLog>'
  );
}

exports.getTmpName = function(sid, username){
  return `${global.CONF.TMP_PATH}/${sid}-${username}`
}

exports.emptyObject = function(){
  var o = new Object(null);
  o.__proto__ = null;
  return o;
}


//*******************************************************************************/
//The following is copy and modify from express-generator's bin/www file.
/**
 * Normalize a port into a number, string, or false.
 */

exports.normalizePort = function(val) {
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

exports.onError = function(port){
  return function(error) {
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
}

/**
 * Event listener for HTTP server "listening" event.
 */

exports.onListening = function(server, callback) {
  return function(){
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
    console.log('NODE_ENV ' + process.env.NODE_ENV);
    callback && callback();
  }
}

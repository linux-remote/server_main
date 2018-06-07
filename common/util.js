const {execSync} = require('child_process');

exports.getTimeZoneName = function(){
  try{
    execSync('cat /etc/timezone').toString().trim();
  }catch(e){
    return '---';
  }
}

function getClientIp(req){
  return req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  req.connection.socket.remoteAddress;
}

const codeMap = require('./code-map');

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
    //+ '\n IP ' + getClientIp(req)
    + '\n time ' + Date()
    + '\n </errorLog>'
  );
}



exports.getTmpName = function(sid, username){
  return `${global.SESSION_PATH}/${sid}+${username}`
}

//*******************************************************************************/
//The following is copy and modify from 'express-generator' generated project's bin/www file.
//https://github.com/expressjs/generator
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

//如果多的话查找上下同位置是否为空

function stdout2json(stdStr){
  let arr = stdStr.split(EOL);
  arr.shift(); //去除头部 TH
  arr.pop(); //去除尾部空字符
  console.log(arr.length);
  return arr.map(line => {
    line = line.split(/\s+/);
    return line;
  })
}

const {EOL} = require('os');
const exec = require('child_process').exec;
exec('ls -l -Q --time-style=long-iso "/home/dw/stdout_format/"', function(err, reslut2){
  if(err){
    return console.error(err);
  }
  const result = stdout2json(reslut2);
  console.log('result', result);
})
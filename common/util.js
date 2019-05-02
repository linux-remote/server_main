exports.timeFormat = function(date, fmt){
  date = date ? new Date(date) : new Date();
  fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  return fmt;
}

const uid = require('uid-safe');
const fs = require('fs');
const path = require('path');
exports.ensureUniqueId = function(filePath){
  return function generateId() {
    var id = uid.sync(24);
    try{ 
      fs.statSync(path.join(filePath, id))
    } catch(e) {
      if(e.code === 'ENOENT'){
        return id;
      }
      console.error('sess middleware generateId fail.')
      throw e
    }
    return generateId()
  }
}
// const {execSync} = require('child_process');

// exports.getTimeZoneName = function(){
//   try{
//     execSync('cat /etc/timezone').toString().trim();
//   }catch(e){
//     return '---';
//   }
// }

// use express req.ip 
// https://expressjs.com/en/api.html#req.ip
// function getClientIp(req){ 


//   return req.headers['x-forwarded-for'] ||
//   req.connection.remoteAddress ||
//   req.socket.remoteAddress ||
//   req.connection.socket.remoteAddress;
// }
// exports.getClientIp = getClientIp;

const codeMap = require('./code-map');

exports.codeErrWrap = function(code, msg = ''){
  var err = new Error(codeMap[code] +  msg);
  err.isCodeError = true;
  err.code = code;
  return err;
}

// exports.errLog = function(errMsg, req){
//   console.error(
//     '\n<errorLog>'
//     + '\n' + errMsg
//     + '\n method ' + req.method
//     + '\n host ' + req.headers.host
//     + '\n originalUrl ' + req.originalUrl
//     + '\n UA ' + req.headers['user-agent']
//     //+ '\n IP ' + getClientIp(req)
//     + '\n time ' + Date()
//     + '\n </errorLog>'
//   );
// }

function _getSessKey(sid, username) {
  return `${sid}+${username}`;
}
exports._getSessKey = _getSessKey;

exports.getTmpName = function(sid, username){
  return `${global.SESSION_PATH}/${_getSessKey(sid, username)}`
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

exports.preventUnxhr = function(req, res){
  if(!req.xhr){
    res.status(400).end("xhr only");
    return true;
  }else{
    return false;
  }
}

// //如果多的话查找上下同位置是否为空
// function stdout2json(stdStr){
//   let arr = stdStr.split(EOL);
//   arr.shift(); //去除头部 TH
//   arr.pop(); //去除尾部空字符
//   console.log(arr.length);
//   return arr.map(line => {
//     line = line.split(/\s+/);
//     return line;
//   })
// }

// const {EOL} = require('os');
// const exec = require('child_process').exec;
// exec('df -T', function(err, reslut2){
//   if(err){
//     return console.error(err);
//   }
//   const result = stdout2json(reslut2);
//   console.log('result', result);
// })
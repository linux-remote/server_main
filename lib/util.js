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

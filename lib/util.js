function getClientIp(req){
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
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
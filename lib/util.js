exports.getClientIp=function(req){
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;
        //req.connection.socket.remoteAddress;
}

exports.errorLog = function(err){
  console.error(
    '*$errorLog$' + '\n' 
    + 'method ' + req.method + '\n'
    + 'host ' + req.headers.host + '\n' 
    + 'originalUrl ' + req.originalUrl + '\n'
    + 'UA ' + req.headers['user-agent'] + '\n'
    + 'IP ' + dwN.getClientIp(req),
    err,
    'time ' + Date() + '\n'
  );
}
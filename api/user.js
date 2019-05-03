const request = require('request');
const fs = require('fs');
const util = require('../common/util');
request.GET = request.get;
request.POST = request.post;
request.PUT = request.put;
request.DELETE = request.delete;
const { isHaveTerm } = require('../lib/session/user-terms');
// exports.proxyWebSocket = function(ws, res){
  
// }
// use
exports.proxy = function(req, res){
  if(!isHaveTerm) {
    return res.status(403).send('Forbidden'); 
  }

  var unixSocket = 'http://unix:' + util.getTmpName(req.session.id, req.params.username) + '.sock:';
  var x = request[req.method](unixSocket + req.url);
  x.on('error', function(err){
    if(err.code === 'ECONNRESET'){ // 用户取消
      return res.end('ECONNRESET');
    }
    console.log('user proxy Error: ', err.code);
  });
  req.pipe(x);
  x.pipe(res);
}
// use
exports.beforeProxy = function(req, res, next){
  const loginedMap = req.session.loginedMap || Object.create(null);
  const username = req.params.username;
  if(!loginedMap[username]){
    return res.status(403).send(username + ' is not login!');
  }
  next();
}


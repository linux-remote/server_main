const request = require('request');
const util = require('../common/util');
const { upUserNow } = require('../lib/user');
request.GET = request.get;
request.POST = request.post;
request.PUT = request.put;
request.DELETE = request.delete;
// exports.proxyWebSocket = function(ws, res){
  
// }
// use
exports.proxy = function(req, res, next){
  // if(!isHaveTerm) {
  //   return res.status(403).send('Forbidden'); 
  // }

  var unixSocket = 'http://unix:' + util.getTmpName(req.session.id, req.params.username) + '.sock:';
  var x = request[req.method](unixSocket + req.url);

  x.on('error', function(err){
    // if(err.code === 'ECONNRESET'){ // 用户取消
    //   return res.end('ECONNRESET');
    // }

    // console.log('x: x on error', err.code, err.message);

    x.abort(); // 代理自己取消.不然如上传文件会一直挂起. 也会触发 1.

    next({
      status: 502,
      name: 'httpRequestProxyError',
      message: err.message
    });
  });

  // x.on('close', function(){
  //   console.log('x: x on close');
  // })
  // console.log('x', x)

  // x.on('timeout', () => {
  //   console.log('x: timeout');
  //   x.abort();
  // });
  // x http.ClientRequest
  // x.on('abort', function(){
  //   if(!x._abort_emit_by_proxy_err){
  //     req.destroy();
  //     console.log('x: x on abort');
  //   }
  // });
  // req: http.IncomingMessage
  req.on('aborted', function(){ // 1. 用户取消.比用浏览器人取消上传. 
    x.abort();// 2. 触发代理取消 -> 触发目标服务器 aborted
    // console.log('proxy: req on aborted');
  });
  req.pipe(x);
  x.pipe(res);
}

// use
exports.verifyUser = function(req, res, next){

  const userMap = req.session.userMap;
  if(userMap){
    const user = userMap.get(req.params.username);
    if(user){
      upUserNow(user);
      next();
      return;
    }
  }

  res.status(403).end('Forbidden');
  
}


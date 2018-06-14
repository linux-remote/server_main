const request = require('request');
const util = require('../common/util');
request.GET = request.get;
request.POST = request.post;
request.PUT = request.put;
request.DELETE = request.delete;

// use
exports.proxy = function(req, res){
  var method = req.method;
  var unixSocket = 'http://unix:' + util.getTmpName(req.session.id, req.params.username) + '.sock:';
  var x = request[method](unixSocket + req.url);
  x.on('error', function(){
    //console.log(chalk.red('request on error'));
    return res.status(500).end('LINUX_REMOTE_USER_SERVER_ERROR');
    //console.log('x.error', err);
  });
  req.pipe(x);
  x.pipe(res);
}
// use
exports.beforeProxy = function(req, res, next){
  const loginedMap = req.session.loginedMap || Object.create(null);
  const username = req.params.username;
  if(!loginedMap[username]){
    console.log(username + ':403 at ' + new Date());
    return res.status(403).send('forbidden!');
  }
  next();
}
// use
// exports.proxyErrorHandler = function(err, req, res){
//   // err.code ECONNREFUSED 进程挂了
//   // err.code ENOENT 目录没权限
//   console.error(chalk.red('proxyErrorHandler'));
//   res.apiError(5);
// }

const request = require('request');
const util = require('../common/util');
request.GET = request.get;
request.POST = request.post;
request.PUT = request.put;
request.DELETE = request.delete;
const chalk = require('chalk');
// use
exports.proxy = function(req, res, next){
  var method = req.method;
  var unixSocket = 'http://unix:' + util.getTmpName(req.session.id, req.params.username) + '.sock:';
  var x = request[method](unixSocket + req.url);
  x.on('error', function(err){
    console.log(chalk.red('request on error'));
    return next(err);
    //console.log('x.error', err);
  });
  req.pipe(x);
  x.pipe(res);
}
// use
exports.beforeProxy = function(req, res, next){
  const loginedList = req.session.loginedList || [];
  //console.log('req.session', req.session);
  const username = req.params.username;
  if(loginedList.indexOf(username) === -1){
    return res.apiError(2);
  }
  next();
}
// use
exports.proxyErrorHandler = function(err, req, res){
  // err.code ECONNREFUSED 进程挂了
  // err.code ENOENT 目录没权限
  //console.error(chalk.red('proxyErrorHandler'));
  res.apiError(5);
}

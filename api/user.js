const request = require('request');
const util = require('../common/util');
const exec = require('child_process').exec;
request.GET = request.get;
request.POST = request.post;
request.PUT = request.put;
request.DELETE = request.delete;

// use
exports.proxy = function(req, res){
  var unixSocket = 'http://unix:' + util.getTmpName(req.session.id, req.params.username) + '.sock:';
  var x = request[req.method](unixSocket + req.url);
  x.on('error', function(err){

    console.log('user proxy Error: ', err.code);

    // if(err.code === 'ENOENT'){ // .sock 文件被删除了. 用户正常退出.
    //   console.log('.sock 文件被删除了.');
    //   return res.apiError(3);
    // }

    let errLogPath = util.getTmpName(req.session.id, req.params.username) + '-err.log';
    
    exec(`tail -n 16 ${errLogPath}`, function(err2, errLog){
      if(err2){
        console.error('user proxy get errlog Error: ', err2);
        return res.apiError(4, err2.code);
      }
      if(!errLog){ //用户正常退出. 会清空log.
        return res.apiError(3); 
      }
      errLog = errLog.split('\n');
      errLog.pop();

      var code;
      if(errLog[errLog.length - 1] === 'EXIT_BY_CHECK_SERVER_LIVE_TIMEOUT'){
        code = 5;

      }else {
        code = 6;
        errLog.shift();
      }
      res.apiError(code,
        '\n\nError log is:\n=================\n' + 
        errLog.join('\n') + 
        '\n=================\nYou can report it at: https://github.com/linux-remote/linux-remote/issues');
    })

    //return res.status(500).end('USER_SERVER_ERROR' + err.message);
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


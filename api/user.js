const request = require('request');
const fs = require('fs');
const util = require('../common/util');
request.GET = request.get;
request.POST = request.post;
request.PUT = request.put;
request.DELETE = request.delete;
// exports.proxyWebSocket = function(ws, res){
  
// }
// use
exports.proxy = function(req, res){
  var unixSocket = 'http://unix:' + util.getTmpName(req.session.id, req.params.username) + '.sock:';
  var x = request[req.method](unixSocket + req.url);
  x.on('error', function(err){
    if(err.code === 'ECONNRESET'){ // 用户取消
      return res.end('ECONNRESET');
    }
    console.log('user proxy Error: ', err.code);

    let errLogPath = util.getTmpName(req.session.id, req.params.username) + '-err.log';


    fs.stat(errLogPath, function(err){
      if(err){
        if(err.code === 'ENOENT'){ // 用户正常退出.
          return res.status(403).send('Forbidden'); 
        } else {
          return res.status(500).send('user proxy stat errlog Error: ' + err.code); 
        }
      } else {
        const getErrorLog = (status, message) => {
          fs.readFile(errLogPath + '.bak', 'utf-8', function(err2, errLog){
            if(err2){
              // console.error('user proxy get errlog Error: ', err2);
              return res.status(500).send('user proxy get errlog Error: ' + err2.code); 
            }
            errLog = errLog ? message +
            '\n\nError log is:\n=================\n' + 
            errLog + 
            '\n=================\nYou can report it at: https://github.com/linux-remote/linux-remote/issues'
              : message;
            res.status(status).send(errLog);
          })
        }

        var loopCount = 0;
        const loop = () => {
          loopCount ++;
          setTimeout(function(){
            request.get(unixSocket + '/live', function(err){
              if(!err){
                getErrorLog(500, 'User process is crash.');

              }else if(loopCount > 5){ 
                getErrorLog(403, 'User process is died.');
              }else {
                loop();
              }
            });
          },500);
        }


        loop();
      }
    })
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


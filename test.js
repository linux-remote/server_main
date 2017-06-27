// var http = require('http');
// var path = require('path');
// var pipeName = '/root/testhttp.sock';
//
// console.log('pipeName', pipeName);
// http.createServer(function(req, res){
//   res.end('hello world!')
// }).listen(pipeName, function(){
//   console.log(arguments)
// });
var fs = require('fs');
fs.stat('/var/tmp/linux-remote/session/fySAD1KdbOLGULiXHC6tZ1Qk-7CmKafw+dw.sock', function(err, result){
  console.log('result.isSocket', result.isSocket());
})

//console.log(uuid.sync(18));

//chmodSync('./test.js', 0o600);

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

var uid = require('uid-safe');
for(let i = 0; i < 99999; i++){
  const str = uid.sync(18);
  if(str.indexOf('+') !== -1){
    throw new Error('str have "."');
  }
}
//console.log(uuid.sync(18));

//chmodSync('./test.js', 0o600);

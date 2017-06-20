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
console.log('test');
var now = Date.now();
setTimeout(()=>{
  console.log(Date.now() - now);
}, 1000)

//console.log(uuid.sync(18));

//chmodSync('./test.js', 0o600);

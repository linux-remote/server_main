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

var {chmodSync} = require('fs');

chmodSync('./test.js', 0o600);

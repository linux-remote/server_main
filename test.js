const http = require('http');
const server = http.createServer(function(req, res){
  res.end('hello world!')
});

server.listen(4002, function(){
  console.log('server listening ' + 4002);
});
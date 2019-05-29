const http = require('http');
const { FLAG } = require('./util');
const server = http.createServer(function(req, res){
  res.type('text').end('hello world');
});

server.listen(() => {
  console.log(FLAG);
});
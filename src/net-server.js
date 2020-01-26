const fs = require('fs');
const os = require('os');
const net = require('net');
const ipcSay = require('./lib/ipc-say');

const PORT = os.tmpdir() + '/linux-remote-server.sock'; 

const server = net.createServer(function connectionListener(socket){
  socket.setEncoding('utf-8');
  socket.on('data', function(data){
    if(data === 'reload'){
      ipcSay({
        type: 'reloadServer'
      }, function(){
        socket.end('ok');
      });
    } else {
      socket.destroy();
    }
  });
});

server.listen(PORT);

server.on('listening', function(){
  fs.chmodSync(PORT, 0o600);
});

server.on('error', (err) => {
  server.close();
  if (err.code === 'EADDRINUSE') {
    fs.unlinkSync(PORT);
    server.listen(PORT);
    return;
  }
  throw err;
});

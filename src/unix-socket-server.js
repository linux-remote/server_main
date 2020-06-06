const fs = require('fs');
const net = require('net');
const os = require('os');

const { triggerOnceToken, getUser} = require('./lib/session.js');

const PORT = os.tmpdir() + '/linux-remote-server_main.sock';


const server = net.createServer(function(socket){

  socket.once('data', function(buffer){
    let onceToken = buffer.toString();
    
    if(typeof onceToken !== 'string'){
      socket.end('type error.');
      return;
    }
    triggerOnceToken(onceToken, function(result){
      if(result.status === 'error'){
        socket.end(result.message);
        return;
      }
      
      const {sid, username} = result.data;
      const user = getUser(sid, username);
      socket.write('ok', function(){
        // logined:
        user.connectedNs = socket;
        if(user.noNsConnected){
          user.noNsConnected();
        }
      });
    });

  });
});

server.listen({
  path: PORT,
  readableAll: true,
  writableAll: true
});

server.on('listening', function(){
  console.info('unix-socket-server listening on ' + PORT);
});

server.on('error', (err) => {
  server.close();
  if (err.code === 'EADDRINUSE') {
    fs.unlinkSync(PORT);
    server.listen(PORT);
  }
});

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(k => {
  process.on(k, () => {
    process.exit(1);
  });
});

process.on('exit', function(){
  try {
    fs.unlinkSync(PORT);
  } catch(e){
    console.error(e);
  }
});

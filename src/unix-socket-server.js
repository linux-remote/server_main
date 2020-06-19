const fs = require('fs');
const net = require('net');
const os = require('os');
const { getUser } = require('./lib/session.js');

const PORT = (global.IS_PRO ? os.tmpdir() : '/dev/shm') + '/linux-remote-server_main.sock';

const server = net.createServer(function(socket){

  socket.once('data', function(buffer){
    let msgs = buffer.toString();
    if(typeof msgs !== 'string'){
      socket.end('type error.');
      return;
    }
    msgs = msgs.split(' ');
    if(msgs.length === 2){
      // sid + username
      // when server_main reload use it.
      _done(msgs[0], msgs[1]);
    }  else {
      socket.end('msgs length error.');
    }

    function _done(sid, username){
      const user = getUser(sid, username);
      if(user){
        if(user.wsWaitTimer === null){
          socket.end('ws wait timeout.');
          delete(user.wsWaitTimer);
          return;
        }
        socket.write('ok');
        // Avoid sticking
        socket.once('data', function(){
          
          console.log('[server_main]: user connected');

          if(user.wsWaitTimer){
            clearTimeout(user.wsWaitTimer);
            delete(user.wsWaitTimer);
          }
          user.newNsPipeWs(socket);
        });

      } else {
        socket.end('not has user');
      }
    }

  });
});



function _listen(){
  server.listen({
    path: PORT,
    readableAll: true,
    writableAll: true
  });
}
_listen();
server.on('listening', function(){
  console.info('unix-socket-server listening on ' + PORT);
});

server.on('error', (err) => {
  server.close();
  if (err.code === 'EADDRINUSE') {
    fs.unlinkSync(PORT);
    _listen();
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

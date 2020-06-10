const fs = require('fs');
const net = require('net');
const os = require('os');

const { triggerOnceToken, getUser} = require('./lib/session.js');

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
      _done(msgs[0], msgs[1])
    } else {
      const onceToken = msgs[0];
      triggerOnceToken(onceToken, function(result){
        if(result.status === 'error'){
          socket.end(result.message);
          return;
        }
        
        const {sid, username} = result.data;
        console.log('triggerOnceToken', sid, username)
        _done(sid, username, true);
      });
    }

    function _done(sid, username, isSendSid){
      const user = getUser(sid, username);
      if(user){
        let msg = 'ok';
        if(isSendSid){
          msg = msg + ' ' + sid;
        }
        console.log('done', msg);
        socket.write(msg, function(){
          // logined:
          user.connectedNs = socket;
          if(user.onNsConnected){
            user.onNsConnected(); 
          }
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

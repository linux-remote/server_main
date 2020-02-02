const fs = require('fs');
const os = require('os');
const net = require('net');
const ipcSay = require('./lib/ipc-say');

const PORT = os.tmpdir() + '/linux-remote-inner-net-server.sock'; 

function resWrap(status, data){
  let resData;
  if(status === 'success'){
    resData = {
      status,
      data
    }
  }
  resData = {
    status,
    message: data
  }
  return JSON.stringify(resData);
}

const server = net.createServer(function connectionListener(socket){
  socket.setEncoding('utf-8');
  socket.on('data', function(rawReqData){
    let reqData;
    try {
      reqData = JSON.parse(rawReqData);
    } catch(e){
      console.error(e.name, e.message);
      socket.destroy();
      return;
    }
    const type = reqData.type;
    if(type === 'reload'){
      ipcSay({
        type: 'reloadServer'
      }, function(){
        socket.end(resWrap('success'));
      });
    } else {
      // else if(type === 'userFirstConnect'){ 
      //   ipcSay({
      //     type: 'removeUserAutoDelTimer',
      //     data: reqData.data
      //   }, function(result){
      //     if(result.status === 'success'){
      //       socket.write(resWrap('success', result.data));
      //     } else {
      //       socket.end(resWrap('error', result.message));
      //     }
      //   });
      // }
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

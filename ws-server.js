const WebSocket = require('ws');
const sessMiddleware = require('./lib/session/middleware');
const { getTmpName, safeSend } = require('./common/util');
const USER_PREFIX = '/user/';
const proxyServer = new WebSocket.Server({ noServer: true });

proxyServer.on('connection', function connection(ws, unixSocket) {
  console.log('connection');
  const client = new WebSocket(unixSocket);
  simplePipe(ws, client);
});

// const MAX_AGE = 1000 * 60 * 15;
module.exports = function(server) {
  
  server.on('upgrade', function upgrade(req, socket, head) {

    sessMiddleware(req, {}, () =>{
      const loginedMap = req.session.loginedMap || Object.create(null);
      // const pathname = url.parse(req.url, true).pathname;
      let href = req.url;
      if(href.indexOf(USER_PREFIX) !== 0){
        return socket.destroy();
      }
      //
      href = href.substr(USER_PREFIX.length);
      const _index = href.indexOf('/');
      const username = href.substr(0, _index);
      href = href.substr(_index);
      if(!loginedMap[username]){
        socket.destroy();
      }else{
        //if(parsed.pathname === '/terminal') {
        let unixSocket = getTmpName(req.session.id, username);
        unixSocket = unixSocket + '.sock:';

        // https://stackoverflow.com/questions/23930293
        // ws+unix:///tmp/server.sock
        unixSocket = 'ws+unix://' + unixSocket;

        unixSocket = unixSocket + href;

        proxyServer.handleUpgrade(req, socket, head, function done(ws) {
          proxyServer.emit('connection', ws, unixSocket);
        });

        // } else {
        //   socket.destroy();
        // }
      }
    });
  });

}

function simplePipe(serverWs, clientWs){
  serverWs.on('message', function(data) {
    safeSend(clientWs, data);
    clientWs.send(data);
  });
  clientWs.on('message', function(data){
    safeSend(serverWs, data);
  });

  serverWs.on('ping', function(){
    clientWs.ping.apply(clientWs, arguments);
  });

  clientWs.on('pong', function() {
    serverWs.pong.apply(serverWs, arguments);
  })

  serverWs.once('close', function(code, reason){
    // console.log('serverWs close', code, typeof code);
    clientWs.close(1000, reason);
  });

  clientWs.once('close', function(code, reason){
    // console.log('clientWs close', code, typeof code);
    serverWs.close(1000, reason); // error 1006 
  });

  serverWs.on('error', function(err) {
    clientWs.terminate();
    console.error('serverWs error', err);
  })
  clientWs.on('error', function(err) {
    serverWs.terminate();
    console.error('clientWs error', err);
  })
}

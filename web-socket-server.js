const WebSocket = require('ws');
const url = require('url');
const sessMiddleware = require('./lib/sess-middleware');
const { getTmpName } = require('./common/util');

//const {getClientIp} = require('./common/util');
// let unixSocket = 'ws+unix:///dev/shm/linux-remote/PfC6loeqZk20Syd5S4nhTm99vPXnpDzb+dw.sock:/terminal/123';

// const MAX_AGE = 1000 * 60 * 15;
module.exports = function(server) {
  
  server.on('upgrade', function upgrade(req, socket, head) {

    sessMiddleware(req, {}, () =>{
      const loginedMap = req.session.loginedMap || Object.create(null);
      const location = url.parse(req.url, true);
      const user = location.query.user;
      if(!loginedMap[user]){
        socket.destroy();
      }else{
        if(location.pathname === '/terminal') {
          const pid = location.query.pid;
          let unixSocket = getTmpName(req.session.id, user);
          unixSocket = unixSocket + '.sock:';

          // https://stackoverflow.com/questions/23930293
          // ws+unix:///tmp/server.sock
          unixSocket = 'ws+unix://' + unixSocket;

          unixSocket = unixSocket + '/terminal?pid=' + pid;

          const proxyServer = new WebSocket.Server({ noServer: true });

          proxyServer.on('connection', function connection(ws) {
            console.log('connection');
            const client = new WebSocket(unixSocket);
            simplePipe(ws, client);
          });

          proxyServer.handleUpgrade(req, socket, head, function done(ws) {
            proxyServer.emit('connection', ws);
          });

        } else {
          socket.destroy();
        }
      }
    });
  });

}

function simplePipe(serverWs, clientWs){
  serverWs.on('message', function(data) {
    clientWs.send(data);
  });
  clientWs.on('message', function(data){
    serverWs.send(data);
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

  // serverWs.on('error', function(err) {
  //   console.error('serverWs error', err);
  // })
  // clientWs.on('error', function(err) {
  //   console.error('clientWs error', err);
  // })
}

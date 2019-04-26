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

          proxyServer.on('connection', function connection(ws, req) {
            console.log('connection');
            const client = new WebSocket(unixSocket);
            ws.on('message', function(data) {
              client.send(data);
            });
            client.on('message', function(data) {
              ws.send(data);
            });
            ws.on('close', function(code, reason){
              client.close(code, reason);
            });
          });

          proxyServer.handleUpgrade(req, socket, head, function done(ws) {
            proxyServer.emit('connection', ws, req);
          });

        } else {
          socket.destroy();
        }
      }
    });
  });

}

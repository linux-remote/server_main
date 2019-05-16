const WebSocket = require('ws');
const sessMiddleware = require('./lib/session/middleware');
const { getTmpName } = require('./common/util');
const USER_PREFIX = '/user/';
const wsProxy = require('./lib/ws-proxy');
const proxyServer = new WebSocket.Server({ noServer: true });

proxyServer.on('connection', function connection(ws, unixSocket) {
  wsProxy(ws, unixSocket);
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
      
      if(!loginedMap[username]){
        socket.destroy();
      }else{
        href = href.substr(_index);
        let unixSocket = getTmpName(req.session.id, username);
        unixSocket = unixSocket + '.sock:';

        // https://stackoverflow.com/questions/23930293
        // ws+unix:///tmp/server.sock
        unixSocket = 'ws+unix://' + unixSocket;

        unixSocket = unixSocket + href;

        proxyServer.handleUpgrade(req, socket, head, function done(ws) {
          proxyServer.emit('connection', ws, unixSocket);
        });
      }
    });
  });

}

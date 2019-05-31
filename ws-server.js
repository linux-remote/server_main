const sessMiddleware = require('./lib/session/middleware');
const wsProxy = require('./api/ws-proxy');

module.exports = function(server) {
  
  server.on('upgrade', function upgrade(req, socket, head) {
    sessMiddleware(req, {}, () => {
      const userMap = req.session.userMap;
      if(!userMap){
        socket.destroy();
        return;
      }

      if(req.url.indexOf(wsProxy.URL_PREFIX) === 0){
        wsProxy.handleUpgrade(req, socket, head);
        return;
      }
      
      socket.destroy();

    });

  });

}

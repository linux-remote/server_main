const WebSocket = require('ws');
const url = require('url');
const sessMiddleware = require('./lib/sess-middleware');

module.exports = function(server){
  const webSocketServer = new WebSocket.Server({
    verifyClient(info, done){
      const req = info.req;
      if(!req.headers.cookie){
        // need touch server first!
        return done(false);
      }
      sessMiddleware(req, {}, () =>{
        const loginedMap = req.session.loginedMap || Object.create(null);
        const location = url.parse(req.url, true);
        if(!loginedMap[location.query.user]){
          done(false);
        }else{
          done(true);
        }
      });
    },
    server });

  // function broadcast(data){
  //   webSocketServer.clients.forEach((client) => {
  //     client.send(JSON.stringify(data));
  //   })
  // }

  webSocketServer.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    ws.id = req.session.id + '+' + location.query.user;
    ws.send('Hello');
  });
  return webSocketServer;
};

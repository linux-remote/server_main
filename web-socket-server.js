const WebSocket = require('ws');
const fs = require('fs');
const {getTimeZoneName} = require('./common/util');
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
        const loginedList = req.session.loginedList || [];
        const location = url.parse(req.url, true);
        if(loginedList.indexOf(location.query.user) === -1){
          done(false);
        }else{
          done(true);
        }
      });
    },
    server });

  function broadcast(data){
    webSocketServer.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    })
  }

  fs.watchFile('/etc/timezone',  function(){
    broadcast({
      type: 'timeZoneNameChange',
      data: {timeZoneName: getTimeZoneName()}
    });
  });

  webSocketServer.on('connection', function connection(ws) {
    ws.send(JSON.stringify({type:'start', data: {}}));
  });

};

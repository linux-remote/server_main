const WebSocket = require('ws');
const fs = require('fs');
const {execSync} = require('child_process');
const url = require('url');
const {hostname, arch} = require('os');
const sessMiddleware = require('./lib/sess-middleware');

function getTimeZoneName(){
  return execSync('cat /etc/timezone').toString().trim();
}


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

  const d = new Date();
  var data = {
    hostname: hostname(),
    arch : arch(),
    timeZoneName: getTimeZoneName(),
    timeZoneOffset: d.getTimezoneOffset(),
    time: d.getTime()
  }

  function broadcast(data){
    webSocketServer.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    })
  }

  fs.watchFile('/etc/timezone',  function(){
    console.log('watch timezone');
    data.timeZoneName = getTimeZoneName();
    broadcast({
      type: 'timeZoneNameChange',
      data: {timeZoneName: data.timeZoneName}
    });
  });

  webSocketServer.on('connection', function connection(ws) {
    ws.send(JSON.stringify({type:'init', data}));
  });

};

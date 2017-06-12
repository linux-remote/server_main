const WebSocket = require('ws');
const fs = require('fs');
const {execSync} = require('child_process');


function getTimeZoneName(){
  return execSync('cat /etc/timezone').toString().trim();
}


module.exports = function(server){
  const webSocketServer = new WebSocket.Server({ server });
  const d = new Date();
  var data = {
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

  webSocketServer.on('connection', function connection(ws, req) {
    console.log('req', req.session);
    //const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    // ws.on('message', function incoming(message) {
    //   console.log('received: %s', message);
    // });

    ws.send(JSON.stringify({type:'init', data}));
  });

};

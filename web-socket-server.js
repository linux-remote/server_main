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
    //const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
    // ws.on('message', function incoming(message) {
    //   console.log('received: %s', message);
    // });

    const request = require('request');
    const fs = require('fs');
    var j = request.jar();
    console.log('req.headers.cookie', req.headers.cookie)
    var cookie = request.cookie(req.headers.cookie);
    var url = `https://${req.headers.host}/getSession`;
    j.setCookie(cookie, url);

    request.get({
      url,
      jar: j,
      agentOptions: {
        ca: fs.readFileSync(global.CONF.DATA_PATH + '/ssl-self-signed/CA.crt')
      },
      end(data){
        console.log('data', data);
      }
    }, function(err, req, body){
      console.log('data end', body);
    });
    //req.pipe(x);
    // x.on('end', function(err){
    //   console.log('data end', arguments);
    // });
    ws.send(JSON.stringify({type:'init', data}));
  });

};

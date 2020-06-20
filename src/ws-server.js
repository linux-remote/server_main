const WebSocket = require('ws');
const { initSession, getUser } = require('./lib/session.js');
const ipcSay = require('./lib/ipc-say.js');
const wsWaitTimerout = 5000;



const wsServer = new WebSocket.Server({ noServer: true, perMessageDeflate: false });
const URL_PREFIX = global.__API_PATH__ + '/user/';
// url: ws://127.0.0.1:3000/api/user/:username
function getUsername(url){
  if(url.indexOf(URL_PREFIX) === 0){
    return url.substr(URL_PREFIX.length);
  }
  return '';
}

function handleServerUpgrade(req, socket, head) {
  const username = getUsername(req.url);
  if(!username){
    socket.destroy();
    return;
  }
  initSession(req);
  let user;
  if(req.sessionId){
    user = getUser(req.sessionId, username);
  }
  if(!user){
    socket.destroy();
    return;
  }
  user.ensureClearUnloadTimeout();
  wsServer.handleUpgrade(req, socket, head, function done(ws) {
    let isNsReady = user.newWsPipeNs(ws);
    if(!isNsReady){
      ipcSay({type: 'startUser', data: {sid: req.sessionId, username}});
      user.wsWaitTimer = setTimeout(function(){
        ws.close(1011, 'wait ns timerout.');
        user.wsWaitTimer = null;
      }, wsWaitTimerout);
    }
  });
}

module.exports = function wsServer(server){
  server.on('upgrade', handleServerUpgrade);
};


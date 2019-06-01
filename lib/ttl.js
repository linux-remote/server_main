const { wsServer } = require('../api/ws-proxy');
const { sessMap } = require('./session/money-store');

// https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
function noop() {}

function heartbeat() {
  console.log('ttl heartbeat');
  this.isAlive = true;
}

wsServer.on('connection', function connection(ws) {
  console.log('on connection in ttl');
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wsServer.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
  
  const now = Date.now();
  sessMap.forEach((users, sid) => {
    users.forEach((user, username) => {
      if(user.expire >= now){
        user.term.kill();
        users.delete(username);
      }
    });
    if(!users.size){
      sessMap.delete(sid);
    }
  });
}, 30000);
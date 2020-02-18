const net = require('net');
const WebSocket = require('ws');

const { initSession, initSessUser } = require('./lib/session');
// const ws2ns = require('./lib/ws2ns');

function wsInitSessUser(req, username, callback){

  initSession(req, function(){
    callback(initSessUser(req, username));
  });
}

const wsServer = new WebSocket.Server({ noServer: true });
const URL_PREFIX = '/api/user/';
const TMP_DIR = global.__TMP_DIR__ + '/linux-remote';
// url: ws://127.0.0.1:3000/api/user/:username
function getUsername(url){
  if(url.indexOf(URL_PREFIX) === 0){
    return url.substr(URL_PREFIX.length);
  }
  return '';
}

function initConnectedNs(user, session, username, callback){

  if(user.connectedNs && !user.connectedNs.destroyed){
    callback(null, user.connectedNs);
    return;
  }

  
  function _dataListener(data){
    if(data === 'ok'){
      end(null, client);
    } else {
      end(new Error('403'));
    }
  }
  function _errListener(err){
    end(err);
  }

  let isEnd = false;
  let timer = null;

  const client = net.createConnection(`${TMP_DIR}/${session.hash}.${username}`, () => {
    client.setEncoding('utf-8');
    client.write(session.id);
    client.once('data', _dataListener);
  });
  client.once('error', _errListener);
  timer = setTimeout(function(){
    client.destroy();
    end(new Error('userServerConnectTimeout'));
  }, 5000);
  function end(err){
    if(isEnd){
      return;
    }
    isEnd = true;
    if(timer){
      clearTimeout(timer);
      timer = null;
    }
    client.off('data', _dataListener);
    client.off('error', _errListener);
    if(err){
      return callback(err);
    }
    user.connectedNs = client;
    return callback(null, client);
  }
}

function handleServerUpgrade(req, socket, head) {
  const username = getUsername(req.url);
  if(!username){
    socket.destroy();
  }
  wsInitSessUser(req, username, function(user){
    if(!user){
      socket.destroy();
      return;
    }
    initConnectedNs(user, req.session, username, function(err, connectedNs){
      if(err){
        socket.destroy();
        if(err.message === '403'){
          console.error('user-server verify sid fail.');
        } else {
          console.error('userServerConnectError', err);
        }
        
        return;
      }
      wsServer.handleUpgrade(req, socket, head, function done(ws) {
        wsServer.emit('connection', ws, connectedNs);
      });
    })
  })
}

// wsServer.on('connection', ws2ns);
wsServer.on('connection', wsPipe);
function wsPipe(ws, socket){
  //_console.log('wsPipe');
  const duplex = WebSocket.createWebSocketStream(ws, { encoding: 'utf8' });
  duplex.pipe(socket);
  socket.pipe(duplex);
}

module.exports = function wsServer(server){
  server.on('upgrade', handleServerUpgrade);
};


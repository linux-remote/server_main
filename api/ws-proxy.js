const WebSocket = require('ws');
const { getTmpName } = require('../common/util');

const wsServer = new WebSocket.Server({ noServer: true });
const wsProxy = require('../lib/ws-proxy');
const URL_PREFIX = '/api/user/';
wsServer.on('connection', function connection(ws, unixSocket) {
  wsProxy(ws, unixSocket);
});



function handleUpgrade(req, socket, head) {

  let href = req.url;
  href = href.substr(URL_PREFIX.length);
  const _index = href.indexOf('/');
  const username = href.substr(0, _index);

  if(!req.session.userMap.has(username)){
    socket.destroy();
    return;
  }

  href = href.substr(_index);
  let unixSocket = getTmpName(req.session.id, username);
  unixSocket = unixSocket + '.sock:';

  // https://stackoverflow.com/questions/23930293
  // ws+unix:///tmp/server.sock
  unixSocket = 'ws+unix://' + unixSocket;

  unixSocket = unixSocket + href;

  wsServer.handleUpgrade(req, socket, head, function done(ws) {
    wsServer.emit('connection', ws, unixSocket);
  });

}

module.exports = {
  URL_PREFIX,
  handleUpgrade
}

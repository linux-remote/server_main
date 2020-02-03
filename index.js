// Entry
global.IS_PRO = process.env.NODE_ENV === 'production';
const client = require('./src/session-sotre-client.js');

client.on('connect', function(){
  const server = require('./src/server.js');
  const wsServer = require('./src/ws-server.js');
  wsServer(server);
});

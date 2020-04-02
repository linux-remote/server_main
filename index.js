const os = require('os');

global.IS_PRO = process.env.NODE_ENV === 'production';
// Protect my disk
global.__TMP_DIR__ = global.IS_PRO ? os.tmpdir() : '/dev/shm';

const server = require('./src/server.js');
const wsServer = require('./src/ws-server.js');
wsServer(server);

process.on('disconnect', () => {
  console.log('serverProcess ondisconnect');
  process.exit();
});

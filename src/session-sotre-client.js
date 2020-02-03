const net = require('net');
const os = require('os');

const client = net.createConnection(global.__TMP_DIR__ + '/linux-remote-session-store.sock');

client.on('close', function(){
  process.exit(1);
});

module.exports = client;

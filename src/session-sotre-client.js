const net = require('net');

const client = net.createConnection(global.__TMP_DIR__ + '/linux-remote-session-store.sock');
client.setEncoding('utf-8');
client.setNoDelay(true);

client.on('close', function(){
  process.exit(1);
});

module.exports = client;

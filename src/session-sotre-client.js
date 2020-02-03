const net = require('net');
const os = require('os');

const client = net.createConnection(os.tmpdir() + '/linux-remote-session-store.sock');

client.on('close', function(){
  process.exit(1);
});

module.exports = client;

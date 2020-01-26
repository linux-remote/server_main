const net = require('net');
const os = require('os');

// Entry
global.IS_PRO = process.env.NODE_ENV === 'production';

const client = net.createConnection(os.tmpdir() + '/linux-remote-session-store.sock');

client.on('close', function(){
  process.exit(1);
});

module.exports = client;

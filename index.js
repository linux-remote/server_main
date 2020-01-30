const net = require('net');
const os = require('os');

// Entry
global.IS_PRO = process.env.NODE_ENV === 'production';

const server = require('./src/server.js');
const wsServer = require('./src/ws-server.js');
wsServer(server);

require('./src/inner-net-server.js');

process.on('disconnect', function(){
  process.exit(1);
})
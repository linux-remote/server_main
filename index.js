"use strict";

require('./src/init.js');
const server = require('./src/server.js');
const wsServer = require('./src/ws-server.js');
wsServer(server);

process.on('disconnect', () => {
  console.log('serverProcess ondisconnect');
  process.exit();
});

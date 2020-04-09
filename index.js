"use strict";

require('./src/init.js');
require('./src/server.js');

process.on('disconnect', () => {
  console.log('serverProcess ondisconnect');
  process.exit();
});

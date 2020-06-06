"use strict";

require('./init.js');

process.on('disconnect', () => {
  console.log('serverProcess ondisconnect');
  process.exit();
});

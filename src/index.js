"use strict";

require('./init.js');

process.on('disconnect', () => {
  console.log('sever_main end');
  process.exit();
});

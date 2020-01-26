const net = require('net');
const os = require('os');

const sessionStoreClient = require('./src/session-sotre-client.js');
// Entry
global.IS_PRO = process.env.NODE_ENV === 'production';

sessionStoreClient.once('connect', function(){
  require('./src/server.js');
});


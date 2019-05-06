
// 本地开发启动。
const path = require('path');
var linuxRemoteServer = require('./index');

linuxRemoteServer({
  userServerMain: path.join(__dirname, '../user-server/watcher.js'),
  ssl: false
});

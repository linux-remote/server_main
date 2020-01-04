// 本地开发启动。
const path = require('path');
var linuxRemoteServer = require('./index');

linuxRemoteServer({
  entranceServerPath: path.join(__dirname, '../server-entrance/index.js'),
  userServerPath: path.join(__dirname, '../user-server/watcher.js'),
  loginBinPath: '/home/dw/c-out/lr-login'
});

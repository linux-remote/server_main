
// 本地开发启动。
const path = require('path');
var createServer = require('./index');
const watchHere = require('../../watch-here/index');

watchHere({
  dir: path.join(__dirname, 'src'),
  id: 'server',
  run(){
    createServer(path.join(__dirname, './dev.config.js'));
  }
});


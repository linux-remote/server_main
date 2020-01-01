
const { spawn } = require('child_process');
const sessions = require('./src/session');

module.exports = function({entranceServerPath, userServerPath, loginBinPath, confPath}){
  global.CONF = {
    userServerPath,
    loginBinPath
  }
  sessions.init();

  const ep = spawn(process.argv[0], [entranceServerPath], {
    stdio: ['ignore', 'ignore', 'ignore', 'ipc']
  });

  ep.on('message', function(msgObj) {
    let data;
    switch(msgObj.method){
      case 'getConfPath':
        data = confPath;
        break;
      case 'getSessions':
      case 'login':
      case 'startUserServer':
      case 'logout':
        data = sessions[msgObj.method](msgObj);
        break;
    }
    ep.send(data);
  });

  process.on('exit', function(){
    sessions.clearUp();
  });
}

const { spawn } = require('child_process');
const sessions = require('./src/session');
const ipc = require('./src/ipc');

module.exports = function({entranceServerPath, userServerPath, loginBinPath}){

  global.CONF = {
    userServerPath,
    loginBinPath
  }
  
  sessions.init();

  const entranceProcess = spawn(process.argv[0], [entranceServerPath], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  ipc(entranceProcess);

  process.on('exit', function(){
    sessions.clearUp();
  });

}
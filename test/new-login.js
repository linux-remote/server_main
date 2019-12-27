const path = require('path');
const loginFilePath = path.join(__dirname, 'ipc-login.js');
const {spawn} = require('child_process');


function separateLogin(opts, callback){
  const ls = spawn(process.argv[0], [loginFilePath], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore', 'ipc']
  });
  
  ls.send(opts);
  
  ls.once('message', function(obj){
    callback(obj);
    ls.disconnect();
    ls.unref();
  });
  
}

module.exports = separateLogin;

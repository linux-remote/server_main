const path = require('path');
const loginFilePath = path.join(__dirname, 'ipc-login.js');
const {spawn} = require('child_process');


function separateLogin(opts, callback){
  const ls = spawn(process.argv[0], [loginFilePath], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore', 'ipc']
  });
  
  ls.send(opts);

  let isDone = false;
  function done(data){
    if(isDone){
      return;
    }
    isDone = true;
    
    callback(data);
    ls.disconnect();
    ls.unref();
  }
  
  ls.once('message', done);

  ls.on('error', function(err){
    done({error: true, message: err.message})
  })
  // ls.on('close', function(code){ // Will be executed before error.
  //   done({error: true, message: `Login child process exited with code ${code}`})
  // })
}

module.exports = separateLogin;

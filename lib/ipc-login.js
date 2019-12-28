const login = require('./login');
const startUserServer = require('./start-user-server');

process.once('message', function({username, password, ip, sidHash}){
  
  const term = login({
    username,
    password,
    ip,
    end(err, output) {
      function _handleErr(errMessage){
        process.send({error: true, message: errMessage});
        term.kill();
        process.exit();
      }
      if(err){
        _handleErr(err.message);
      } else {
        startUserServer(term, sidHash, username, function(err) {
          if(err) {
            _handleErr('[linux-remote]: user server start-up fail. ' + err.message);
          } else {
            process.send({error: false, message: output});
          }
        });
      }
    }
  });
})


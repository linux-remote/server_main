const fs = require('fs');
const {getTmpName} = require('../../lib/new-session');
module.exports = function(sid, username){
  fs.unlink(getTmpName(sid, username) + '.sock', (err) => {
    if(err && err.code !== 'ENOENT'){
      return console.error('.sock clear error', err);
    }
    // _console.log('\n\n.sock', sid, username, 'clear OK!\n\n');
  });
}
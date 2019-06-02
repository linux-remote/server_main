const fs = require('fs');
const { getTmpName } = require('../../common/util');
module.exports = function(sid, username){
  fs.unlink(getTmpName(sid, username) + '.sock', (err) => {
    if(err && err.code !== 'ENOENT'){
      return console.error('.sock clear error', err);
    }
    console.log('\n\n.sock', sid, username, 'clear OK!\n\n');
  });
}
const {execSync} = require('child_process');

exports.getTimeZoneName = function(){
  return execSync('cat /etc/timezone').toString().trim();
}

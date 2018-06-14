
const exec = require('child_process').exec;
exports.getTimeZone = function(callback){
  exec('timedatectl', function(err, str){
    if(err){
      return callback(err);
    }
    str = str.split('\n');
    // var localTime = str[0];
    // localTime = localTime.split(/\s+/);
    // localTime = localTime.splice(localTime.length - 3, 3);
    str = str[3];
    str = str.split(':')[1];
    str = str.trim();
    str = str.split('(');
    const name = str[0].trim();
    str = str[1];
    str = str.substr(0, str.length - 1);
    str = str.split(',');

    callback(err, {
      name,
      offset: {
        name: str[0],
        hour: str[1].trim()
      }
    });
  })
}

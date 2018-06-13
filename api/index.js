const appList = require('./third-party-app');
const exec = require('child_process').exec;
function getTimeZone(callback){
  exec('timedatectl', function(err, str){
    if(err){
      return callback(err);
    }
    str = str.split('\n');
    // var localTime = str[0];
    // localTime.split(/\s+/);
    // localTime = localTime.s;

    str = str[3];
    str = str.split(':')[1];
    str = str.trim();
    str = str.split('(');
    const name = str[0].trim();
    str = str[1];
    str = str.substr(0, str.length - 1);
    callback(err, {
      name,
      offset: str
    });
  })
}
getTimeZone(function(){
  console.log(arguments)
})
// get
exports.touch = function(req, res){
  const d = new Date();
  let data = {
    thirdPartyApp: appList,
    loginedMap: req.session.loginedMap,
    timeZoneName: '',
    timeZoneOffset: d.getTimezoneOffset(),
    time: d.getTime()
  };
  res.apiOk(data);
}


// get
exports.time = function(req, res){
  const d = new Date();
  const data = {
    timeZoneName: '',
    timeZoneOffset: d.getTimezoneOffset(),
    time: d.getTime()
  }
  res.apiOk(data);
}

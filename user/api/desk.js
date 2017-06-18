const os = require('os');
const {execSync} = require('child_process');
// const fs = require('fs');
//const util = require('../../common/util');
exports.info = function(req, res){
  res.apiOk({
    hostname: os.hostname(),
    homedir: os.homedir()
    //username: process.env.USER,
  })
}
//console.log(process.env.TZ)
//const test = 1496980789360; //2017-6-9 11: 59

function getTimeZoneName(){
  return execSync('cat /etc/timezone').toString();
}

var timeZoneName = getTimeZoneName();
//const timeZoneName = getTimeZoneName();


// fs.watchFile('/etc/timezone',  function(){
//   console.log('watch timezone');
//   timeZoneName = getTimeZoneName();
// });

exports.time = function(req, res){
  const d = new Date();
  res.apiOk({
    time : d.getTime(),
    timeZoneOffset: d.getTimezoneOffset(),
    timeZoneName
  });
}

// exports.time = function(req, res){
//   const d = new Date();
//   console.log('getTimezoneOffset', d.getTimezoneOffset())
//   res.apiOk({
//     time: d.getTime(),
//     timeZone: d.getTimezoneOffset()
//   });
// }

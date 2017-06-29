var express = require('express');
var router = express.Router();
const {getTimeZoneName} = require('../../common/util');
const os = require('os');
const {exec} = require('child_process');
const dustbin = require('./dustbin');

router.use('/dustbin', dustbin);

router.get('/info', function(req, res){
  exec('groups', (err, result) => {
    res.apiOk({
      groups: result.split(' '),
      hostname: os.hostname(),
      homedir: os.homedir(),
      uptime: os.uptime(),
      type: os.type(),
      platform: os.platform(),
      networkInterfaces: os.networkInterfaces(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      tmpdir: os.tmpdir(),
      endianness: os.endianness(),
      cpus: os.cpus(),
      arch: os.arch(),
      EOL: os.EOL,
      release: os.release()
    })
  })

});

router.get('/time', function(req, res){
  const d = new Date();
  res.apiOk({
    time : d.getTime(),
    timeZoneOffset: d.getTimezoneOffset(),
    timeZoneName: getTimeZoneName()
  });
});

const fs = require('fs');

router.get('/fstest', function(req, res){
  fs.readdir('/home/dw', (err ,result) => {
    res.apiOk(result.join(' '));
  })
});
router.get('/fslstest', function(req, res){
  exec('ls -a -l -Q --color --time-style=long-iso /home/dw',{env: {LS_COLORS: 'no=:or=OR'}}, (err, result) => {
    res.apiOk(result)
  })
});

// function _getIdName(str){
//   str = str.split('(');
//   const id = str[0];
//   let name = str[1];
//   name = name.substr(0, name.indexOf(')'));
//   return {
//     id,
//     name
//   }
// }
//
// function _getGroups(str){
//   return str.split(',').map(v => _getIdName(v))
// }
//
// function _parse(result){
//
//   // uid=1000(dw) gid=1000(dw) groups=1000(dw),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),113(lpadmin),128(sambashare)
//
//   result = result.split(/ +/g);
//   result = result.map(v => {
//     return v.split('=')[1];
//   });
//   return {
//     user: _getIdName(result[0]),
//     group: _getIdName(result[1]),
//     groups: _getGroups(result[2])
//   }
// }
//
// router.get('/userInfo', function(req, res, next){
//   exec('id', (err, result) =>{
//     if(err){
//       return next(err);
//     }
//     res.apiOk(_parse(result));
//   })
//
// });
//
// router.get('/groups', function(req, res, next){
//   exec('groups', (err, result) =>{
//     if(err){
//       return next(err);
//     }
//     res.apiOk(result.split(/ +/g));
//   })
//
// });

module.exports = router;

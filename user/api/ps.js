// const os = require('os');
const {exec} = require('child_process');
const ps = function(req, res, next) {
  exec('ps aux --sort=-pcpu | head -n 50', function(err, reslut) {
    if(err) {
      return next(err);
    }
    res.apiOk(reslut);
  });
}
module.exports = ps;

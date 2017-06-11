const os = require('os');
exports.info = function(req, res){
  res.apiOk({
    hostname: os.hostname()
    //username: process.env.USER,
  })
}

exports.time = function(req, res){
  res.apiOk(Date.now());
}

const CONF = global.CONF;
const {getTimeZoneName} = require('../common/util');
// get
exports.touch = function(req, res){
  let data = {
    loginedMap: req.session.loginedMap || Object.create(null)
  };

  res.apiOk(data);
}

// get
exports.time = function(req, res){
  const d = new Date();
  const data = {
    timeZoneName: getTimeZoneName(),
    timeZoneOffset: d.getTimezoneOffset(),
    time: d.getTime()
  }
  res.apiOk(data);
}

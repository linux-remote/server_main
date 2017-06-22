const CONF = global.CONF;
const {getTimeZoneName} = require('../lib/util');
// get
exports.touch = function(req, res){
  const data = {
    CADownloadedCount: CONF.sslSelfSigned._indexData.CADownloadedCount,
    loginedList: req.session.loginedList || []
  }

  if(!data.CADownloadedCount){
    data.CACertPath = CONF.ssl.caCertPath;
  }
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

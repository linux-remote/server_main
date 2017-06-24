const CONF = global.CONF;
const {getTimeZoneName} = require('../lib/util');
// get
exports.touch = function(req, res){
  let data;
  if(CONF.ssl.caCertPath){

    data = {
      isSelfSigned: true,
      indexNotice: CONF.indexNotice || `<span style="color: red">This webside's ssl cert is selfSigned,<br>The CA cert please ask about creator.</span>`,
      CADownloadedCount: CONF.sslSelfSigned._indexData.CADownloadedCount,
      loginedList: req.session.loginedList || []
    }
    if(!data.CADownloadedCount){
      data.CACertPath = CONF.ssl.caCertPath;
    }
  }else{
    data = {
      isSelfSigned: false,
      indexNotice: CONF.notice
    }
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

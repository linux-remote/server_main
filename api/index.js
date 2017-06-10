const CONF = global.CONF;

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

var login = require('../lib/login');

exports.touch = function(req, res, next){
  res.apiOk({
    CADownloadedCount: CONF.sslSelfSigned._indexData.CADownloadedCount,
    CACertPath: CONF.ssl.caCertPath,
    loginedList: req.session.loginedList || []
  });
}

exports.login = function(req, res, next){
  var {username, password} = req.body;
  login(username, password, req.session.id, function(err, port){
    if(err){
      return next(err);
    }
    if(!req.session.loginedList){
      req.session.loginedList = [];
    }
    req.session.loginedList.push({
      userName: username,
      port
    });
    res.apiOk(port);
  });
}



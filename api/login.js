var login = require('../lib/login');

exports.touch = function(req, res, next){
  console.log('curlUser', req.session);
  const data = {
    CADownloadedCount: CONF.sslSelfSigned._indexData.CADownloadedCount,
    loginedList: req.session.loginedList || []
  }

  if(!data.CADownloadedCount){
    data.CACertPath = CONF.ssl.caCertPath;
  }
  res.apiOk(data);
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
    req.session.loginedList.push(username);
    console.log('req.session', req.session);
    res.apiOk(port);
  });
}

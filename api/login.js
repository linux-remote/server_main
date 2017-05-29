var login = require('../lib/login');

var util = require('../lib/util');

exports.loginedList = function(req, res, next){
  var logined = req.session.logined || [];
  res.apiOk(logined);
}

exports.login = function(req, res, next){
  console.log('req.body', req.body);
  var {username, password} = req.body;
  login(username, password, function(err, port){
    if(err){
      return next(err);
    }
    res.apiOk(port);
  });
}



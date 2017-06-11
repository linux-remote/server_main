var login = require('../lib/login');

// post
exports.login = function(req, res, next){
  var {username, password} = req.body;
  var loginedList = req.session.loginedList || [];
  if(loginedList.indexOf(username) !== -1){
    return res.apiOk({
      alreadyLogined: true
    });
  }
  login(username, password, req.session.id, function(err){
    if(err){
      return next(err);
    }

    if(!req.session.loginedList){
      req.session.loginedList = [];
    }
    req.session.loginedList.push(username);
    res.apiOk(req.session.loginedList);
  });
}

// post
exports.logout = function(req, res){
  var i = req.session.loginedList.indexOf(req.body.username);
  if(i !== -1){
    req.session.loginedList.splice(i, 1);
  }
  res.apiOk(req.session.loginedList);
}

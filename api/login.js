const login = require('../lib/login');
const request = require('request');
const util = require('../common/util');
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
// exports.logout = function(req, res, next){
//   var i = req.session.loginedList.indexOf(req.params.username);
//   if(i !== -1){
//     req.session.loginedList.splice(i, 1);
//   }
//   next();
// }

// post
exports.logout = function(req, res){
  request.delete('http://unix:' +
  util.getTmpName(req.session.id, req.body.username) +
  '.sock:/exit', function(){
    console.log('exit')
    var i = req.session.loginedList.indexOf(req.body.username);
    if(i !== -1){
      req.session.loginedList.splice(i, 1);
    }
    //next();
    res.apiOk(req.session.loginedList);

  })

}

const login = require('../lib/login');
const sas = require('sas');
const request = require('request');
const util = require('../common/util');
// post
exports.login = function(req, res, next){
  var {username, password} = req.body;
  var loginedList = req.session.loginedList || [];

  function checkIsLogin(callback){
    const index = loginedList.indexOf(username);
    if(index !== -1){
      // return res.apiOk({
      //   alreadyLogined: true
      // });
      request.get('http://unix:' +
      util.getTmpName(req.session.id, req.body.username) +
      '.sock:/live', function(err){
        if(err){
          loginedList.splice(index, 1);
          return callback();
        }else{
          callback('$up');
        }
      })
    }else{
      callback();
    }
  }

  function userLogin(callback){
    login(username, password, req.session.id, function(err){
      if(err){
        return callback(err);
      }
      loginedList.push(username);
      req.session.loginedList = loginedList;
      callback();
      //res.apiOk(req.session.loginedList);
    });
  }

  sas([checkIsLogin, userLogin], function(err){
    if(err) return next(err);
    res.apiOk(loginedList);
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
    console.log('exit');
    const loginedList = req.session.loginedList || [];
    var i = loginedList.indexOf(req.body.username);
    if(i !== -1){
      loginedList.splice(i, 1);
      req.session.loginedList = loginedList;
    }
    //next();
    res.apiOk(loginedList);

  })

}

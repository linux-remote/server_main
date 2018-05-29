const login = require('../lib/login');
const sas = require('sas');
const request = require('request');
const util = require('../common/util');
// post
exports.login = function(req, res, next){
  var {username, password} = req.body;
  var loginedMap = req.session.loginedMap || Object.create(null);

  function checkIsLogin(callback){
    if(loginedMap[username]){
      // return res.apiOk({
      //   alreadyLogined: true
      // });
      request.get('http://unix:' +
      util.getTmpName(req.session.id, req.body.username) +
      '.sock:/live', function(err){
        if(err){
          delete(loginedMap[username]);
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
      loginedMap[username] = true;
      req.session.loginedMap = loginedMap;
      callback();
    });
  }

  sas([checkIsLogin, userLogin], function(err){
    if(err) return next(err);
    res.apiOk(loginedMap);
  });
}

// post
exports.logout = function(req, res){
  const loginedMap = req.session.loginedMap || Object.create(null);
  var username = req.body.username;
  if(!loginedMap[username]){
    return res.apiOk(loginedMap);
  }
  request.delete('http://unix:' +
  util.getTmpName(req.session.id, username) +
  '.sock:/exit', function(){
    console.log(username, 'logout success', Date.now());

    delete(loginedMap[username]);
    req.session.loginedMap = loginedMap;
    //next();
    res.apiOk(loginedMap);

  })

}

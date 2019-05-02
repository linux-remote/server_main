const login = require('../lib/new-login');
const startUserServer = require('../lib/start-user-server');

const userTerms = require('../lib/session/user-terms');

// post
exports.login = function(req, res, next){
  var {username, password} = req.body;
  var loginedMap = req.session.loginedMap || Object.create(null);

  if(loginedMap[username]) {
    return res.apiOk(loginedMap);
  }
  const term = login({
    username,
    password,
    ip: req.ip,
    end(err) {
      if(err){
        console.log('登录失败', err.message);
        return next(err);
      } else {
        console.log('登录成功');
        startUserServer(term, req.session.id, username, function() {
          loginedMap[username] = true;
          req.session.loginedMap = loginedMap;
          userTerms.add(req.session.id, username, term);
          res.apiOk(loginedMap);
        });
      }
    }
  });
  term.on('exit', function() {
    console.log('term exit');
  });
}

// post2
exports.logout = function(req, res){
  const loginedMap = req.session.loginedMap || Object.create(null);
  var username = req.body.username;
  
  if(!loginedMap[username]){
    return res.apiOk(loginedMap);
  }
  userTerms.kill(req.session.id, username);
  delete(loginedMap[username]);
  req.session.loginedMap = loginedMap;
  res.apiOk(loginedMap);
}

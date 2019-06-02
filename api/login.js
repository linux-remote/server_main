const login = require('../lib/login');
const startUserServer = require('../lib/start-user-server');
const { getUser } = require('../lib/user');
const sockClear = require('../lib/session/sock-clear');
// post
exports.login = function(req, res, next){
  
  let userMap = req.session.userMap;
  const {username, password} = req.body;

  if(userMap && userMap.has(username)){
    return res.end('AlreadyLogined');
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
        startUserServer(term, req.session.id, username, function(err) {
          if(err) {
            term.kill();
            res.status(500).end('[linux-remote]: user server start-up fail.')
          } else {
            if(!userMap){
              userMap = new Map;
              userMap.set(username, getUser(term));
              req.session.userMap = userMap;
            }

            res.end('ok');

          }
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
  
  const userMap = req.session.userMap;
  if(!userMap){
    return res.end('ok');
  }
  
  const username = req.body.username;
  const user = userMap.get(username);
  if(user){
    user.term.kill();
    userMap.delete(username);
    if(!userMap.size){
      req.session.destroy();
    }
    sockClear(req.session.id, username);
  }
  
  res.end('ok');

}

// get
exports.loginedList = function(req, res){
  const userMap = req.session.userMap;
  if(!userMap){
    return res.json([]);
  }
  res.json(Array.from(userMap.keys()));
}
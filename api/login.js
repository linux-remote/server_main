const login = require('../lib/login');
const startUserServer = require('../lib/start-user-server');
const { getUser } = require('../lib/user');
const sockClear = require('../lib/session/sock-clear');

// remove IPv4's ::ffff:
// http://www.voidcn.com/article/p-crckexby-bst.html
// https://stackoverflow.com/questions/29411551
function getIP(str){
  if(/::ffff:\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/.test(str)){
    return str.substr(7);
  }
  return str;
}

// post
exports.login = function(req, res, next){
  const sess = req.session;
  const sid = sess.id;
  let userMap = sess.userMap;
  const {username, password} = req.body;

  if(userMap && userMap.has(username)){
    return res.end('AlreadyLogined');
  }

  const term = login({
    username,
    password,
    ip: getIP(req.ip),
    end(err) {
      if(err){
        // _console.log('登录失败', err.message);
        return next(err);
      } else {
        // _console.log('登录成功');
        startUserServer(term, sid, username, function(err) {
          if(err) {
            term.kill();
            res.status(500).end('[linux-remote]: user server start-up fail. ' + err.message);
          } else {
            if(!userMap){
              userMap = new Map;
              sess.userMap = userMap;
            }
            
            const user = getUser(term);
            userMap.set(username, user);

            res.end('ok');

            term.once('exit', function() {  // handle kill by other
              if(user._kill_term_by_self){
                return;
              }
              console.log(' handle term kill by other');
              userMap.delete(username);
              sockClear(sid, username);
            });
          }
        });

      }
    }
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
    user._kill_term_by_self = true; // term exit 是异步的, 这里不等了.
    user.term.kill();
    userMap.delete(username);
    sockClear(req.session.id, username);
    if(!userMap.size){
      req.session.destroy();
    }
    // _console.log('logout user.term kill');
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
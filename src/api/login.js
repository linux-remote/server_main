const ipcSay = require('../lib/ipc-say.js');
// get
exports.loggedInList = function(req, res){
  let users;
  if(req.session){
    if(req.session.userMap){
      users = Array.from(req.session.userMap.keys());
    }
  }
  res.json(users || []);
}

function setCookie(res, sid, cookie){
  res.cookie('sid', sid, {
    httpOnly: true,
    path: '/api',
    secure: cookie.secure,
    sameSite: cookie.sameSite
  });
}

// remove IPv4's ::ffff:
// http://www.voidcn.com/article/p-crckexby-bst.html
// https://stackoverflow.com/questions/29411551
function getIP(str){
  if(/::ffff:\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/.test(str)){
    return str.substr(7);
  }
  return str;
}

// https://raw.githubusercontent.com/expressjs/session/v1.17.0/index.js
// not auto, not true.
function _isCanSetSecureCookie(req){
  if ((req.connection && req.connection.encrypted) || req.secure) {
    return true;
  }
  return false;
}
// post
exports.login = function(req, res, next){
  if(global.CONF.cookie.secure){
    // req.secure used proxy.
    if(!_isCanSetSecureCookie(req)){
      next({
        status: 400,
        message: 'cookie.secure: Not in the secure connection.'
      });
      return;
    }
  }
  
  const {username, password} = req.body;
  if(req.session){
    const userMap = req.session.userMap;
    if(userMap && userMap.has(username)){
      res.end('AlreadyLogined');
      return;
    }
  }
  ipcSay({type: 'login', data: {
    username,
    password,
    ip: getIP(req.ip)
  }}, (result) => {
    if(result.status === 'success'){
      setCookie(res, result.data.sid, global.CONF.cookie);
      res.end('ok');
    } else {
      next({
        message: result.message
      });
    }
  });
}

// post2
exports.logout = function(req, res){
  if(!req.session){
    return res.end('ok');
  }
  const userMap = req.session.userMap;
  if(!userMap){
    return res.end('ok');
  }
  const username = req.body.username;
  const user = userMap.get(username);
  if(!user){
    return res.end('ok');
  }
  ipcSay({type: 'logout', data: {sid: req.session.id, username}}, function(){
    res.end('ok');
  });
}


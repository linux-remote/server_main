const ipcSay = require('../lib/ipc-say.js');
const { addUser } = require('../lib/session.js');
// get
exports.loggedInList = function(req, res){
  let users;
  if(req.session){
    if(req.session.userMap){
      users = Array.from(req.session.userMap.keys());
    }
  }
  res.json({
    v: global.__CLIENT_VERSION__,
    users: users || []
  });
}

function setCookie(res, sid, cookie){
  res.cookie('sid', sid, {
    httpOnly: true,
    path: global.__API_PATH__,
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
  let sid;
  if(req.session){
    const userMap = req.session.userMap;
    sid = req.sessionId;
    if(userMap && userMap.has(username)){
      res.end('AlreadyLogined');
      return;
    }
  }
  ipcSay({type: 'login', data: {
    username,
    password,
    sid,
    ip: getIP(req.ip)
  }}, (result) => {
    if(result.status === 'success'){
      if(!sid){
        setCookie(res, result.data, global.CONF.cookie);
      }
      addUser(result.data, username);
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
  ipcSay({type: 'logout', data: {sid: req.sessionId, username}}, function(){
    res.end('ok');
  });
}


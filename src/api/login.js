const ipcSay = require('../lib/ipc-say');
// get
exports.loggedInList = function(req, res){
  let users = req.session ? Object.keys(req.session.userMap) : [];
  res.json(users);
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

// post
exports.login = function(req, res, next){
  const {username, password} = req.body;
  if(req.session){
    const userMap = req.session.userMap;
    if(userMap[username]){
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
      res.end('ok');
    } else {
      next({
        message: result.message
      })
    }
  })
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
  const user = userMap[username];
  if(!user){
    return res.end('ok');
  }
  ipcSay({type: 'getSession', data: {sid: req.cookies.sid, username}}, function(){
    res.end('ok');
  })
}


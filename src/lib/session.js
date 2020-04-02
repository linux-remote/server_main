
const ipcSay = require('./ipc-say');
const SID_MARK = 'sid=';

function genSessUserMap(users){
  if(!users.length){
    return;
  }
  const userMap = new Map();
  for(let i = 0, len = users.length; i < len; i++){
    userMap.set(users[i], Object.create(null));
  }
  return userMap;
}


function _getSidCookie(cookie = ''){
  let i = cookie.indexOf(SID_MARK);
  if(i === -1){
    return '';
  }
  let str = cookie.substr(i + SID_MARK.length);
  i = str.indexOf(';');
  if(i !== -1){
    str = str.substr(0, i);
  }
  return str;
}

function initSession(req, callback){
  const sid = _getSidCookie(req.headers['cookie']);

  if(!sid){
    callback();
    return;
  }

  ipcSay({type: 'getSession', data: sid}, (result) => {
    if(result.data){
      req.session = {
        id: sid,
        hash: result.data.hash,
        userMap: genSessUserMap(result.data.users)
      }
    }
    callback();
  })
}

function sessionMid(req, res, next){
  initSession(req, next);
}

function initSessUser(req, username){
  if(!req.session){
    return;
  }
  const userMap = req.session.userMap;
  if(!userMap){
    return;
  }
  return userMap.get(username);
}



module.exports = {
  initSession,
  sessionMid,
  initSessUser
};

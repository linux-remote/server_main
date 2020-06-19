
const ipcSay = require('./ipc-say.js');
const User = require('./user.js');
let sidMap = new Map();
const SID_MARK = 'sid=';

function initSidMap(callback){
  ipcSay({type: 'all'}, (result) => {
    const data = result.data;
    Object.keys(data).forEach(function(sid){
      const sess = data[sid];
      const userMap = new Map();

      Object.keys(sess.userMap).forEach(function(username){
        const userData = sess.userMap[username];
        userMap.set(username, new User(userData));
      });
      sess.userMap = userMap;
      sidMap.set(sid, sess);
    });
    callback(null);
  })
}

// function genSessUserMap(users){
//   if(!users.length){
//     return;
//   }
//   const userMap = new Map();
//   for(let i = 0, len = users.length; i < len; i++){
//     userMap.set(users[i], Object.create(null));
//   }
//   return userMap;
// }


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

function addUser(sid, username, userData){
  let session = sidMap.get(sid);
  if(!session){
    session = {
      userMap: new Map()
    }
    sidMap.set(sid, session);
  }
  session.userMap.set(username, new User(userData));
}

function initSession(req){
  const sid = _getSidCookie(req.headers['cookie']);
  if(!sid){
    return;
  }

  req.sessionId = sid;
  req.session = sidMap.get(sid);

  // ipcSay({type: 'getSession', data: sid}, (result) => {
  //   if(result.data){
  //     req.session = { 
  //       id: sid,
  //       hash: result.data.hash,
  //       userMap: genSessUserMap(result.data.users)
  //     }
  //   }
  //   callback();
  // });
}

function getUser(sid, username){
  const sess = sidMap.get(sid);
  if(sess){
    return sess.userMap.get(username);
  }
}


function sessionMid(req, res, next){
  initSession(req);
  next();
}


function removeUser(sid, username){
  const session = sidMap.get(sid);
  if(session){
    const userMap = session.userMap;
    const user = userMap.get(username);
    if(user){
      user.clear();
      userMap.delete(username);
      if(userMap.size === 0){
        sidMap.delete(sid);
      }
    }
  }
}

module.exports = {
  initSidMap,
  initSession,
  sessionMid,
  getUser,
  addUser,
  removeUser
};

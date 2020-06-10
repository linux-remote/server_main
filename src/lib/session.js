
const ipcSay = require('./ipc-say');
let sidMap = new Map();
const SID_MARK = 'sid=';

function initSidMap(callback){
  ipcSay({type: 'all'}, (result) => {
    const data = result.data;
    Object.keys(data).forEach(function(sid){
      const sess = data[sid];
      const userMap = new Map();

      Object.keys(sess.userMap).forEach(function(username){
        const user = sess.userMap[username];
        userMap.set(username, user);
      });
      sess.userMap = userMap;
      sidMap.set(sid, sess);
    })
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

function addUser(sid, username){
  let session = sidMap.get(sid);
  if(!session){
    session = {
      userMap: new Map()
    }
    sidMap.set(sid, session);
  }
  session.userMap.set(username, Object.create(null));
}

function initSession(req, callback){
  const sid = _getSidCookie(req.headers['cookie']);
  
  if(!sid){
    callback();
    return;
  }

  req.session = sidMap.get(sid);
  callback();

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
  initSession(req, next);
  console.log('req.session', req.session);
}

function initSessUser(req, username){
  if(!req.session){
    return;
  }

  return req.session.userMap.get(username);
}

function triggerOnceToken(onceToken, callback){
  ipcSay({type: 'userConnected', data: onceToken}, callback);
}

function restartUserProcess(sid, username, callback){
  ipcSay({type: 'restartUserProcess', data: {
    sid, username
  }}, callback);
}

function removeUser(sid, username){
  const session = sidMap.get(sid);
  if(session){
    const userMap = session.userMap;
    const user = userMap.get(username);
    if(user){
      userMap.delete(username);
      if(userMap.size === 0){
        sidMap.delete(session.id);
      }
    }
  }
}

module.exports = {
  initSidMap,
  initSession,
  sessionMid,
  initSessUser,
  getUser,
  addUser,
  removeUser,
  triggerOnceToken,
  restartUserProcess
};

// not EXPIRE
// 当session为空时不生成文件。
const util = require('util');
const uid = require('uid-safe');

const sessMap = new Map;

function Store() {

}



Store.prototype.get = function(sid, callback){
  const data = sessMap.get(sid);
  if (data) {
    callback(null, data);
  } else {
    callback(null, _getEmptySess());
  }
};

Store.prototype.set = function(sid, data, callback){
  if(Object.keys(data).length === 1){ // {cookie: {}} 判断session为空，不存储。
    return callback();
  }
  
  // data._expires = Date.now() + this.ttlTime;
  sessMap.set(sid, data);
  ttlIfNotStart();
  callback();
}

Store.prototype.destroy = function(sid, callback){
  sessMap.delete(sid);
  callback && callback();
}



//https://stackoverflow.com/questions/23327010/how-to-generate-unique-id-with-node-js
function ensureUniqueId() {
  const sid = uid.sync(24);
  if(!sessMap.has(sid)) {
    return sid;
  }
  return ensureUniqueId();
}

function _getEmptySess() {
  return {cookie:{}};
}

module.exports = {
  Store(session) {
    var defStore = session.Store;
    util.inherits(Store, defStore);
    return Store;
  },
  ensureUniqueId,
  sessMap
}


let ttlTimer;
let isStartTTL = false;
const delay  = 60 * 1000; // one min
const MAX_AGE = 3 * 60 * 1000;

function ttlIfNotStart(){
  if(isStartTTL) {
    return;
  }
  isStartTTL = true;
  // debug('money store ttl start.');
  ttlTimer = setInterval(() => {
    const now = Date.now();
    sessMap.forEach(({userMap}, sid) => {
      userMap.forEach((user, username) => {
        // debug('userMap forEach: ', now, user.now, user.connections);
        if((now - user.now) >= MAX_AGE){
          user.term.kill();
          userMap.delete(username);
          // debug('user: ' + username + ' kill.');
        }
      });
      if(!userMap.size){
        // debug('userMap: size 0.');
        sessMap.delete(sid);
      }
    });
    if(!sessMap.size){
      clearInterval(ttlTimer);
      isStartTTL = false;
      // debug('clearInterval');
    }
  }, delay);

}

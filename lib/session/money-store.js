// not EXPIRE
// 当session为空时不生成文件。
const util = require('util');
const uuidv4 = require('uuid/v4');

const {SESS_TTL_DELAY, SESS_AFR_MAX_AGE} = require('../../constant');
const sockClear = require('./sock-clear');

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
  const sid = uuidv4();
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
function ttlIfNotStart(){
  if(isStartTTL) {
    return;
  }
  isStartTTL = true;
  // _console.log('MONEY_SOTRE_TTL: money store ttl start.');
  ttlTimer = setInterval(() => {
    const now = Date.now();
    sessMap.forEach(({userMap}, sid) => {
      userMap.forEach((user, username) => {
        // _console.log('MONEY_SOTRE_TTL: userMap forEach: ', now, user.now);
        if((now - user.now) >= SESS_AFR_MAX_AGE){
          user._kill_term_by_self = true;
          user.term.kill();
          userMap.delete(username);
          sockClear(sid, username);
          // _console.log('MONEY_SOTRE_TTL: user: ' + username + ' kill.');
        }
      });
      if(!userMap.size){
        // _console.log('MONEY_SOTRE_TTL: userMap: size 0.');
        sessMap.delete(sid);
      }
    });
    if(!sessMap.size){
      clearInterval(ttlTimer);
      isStartTTL = false;
      // _console.log('MONEY_SOTRE_TTL: clearInterval');
    }
  }, SESS_TTL_DELAY);

}

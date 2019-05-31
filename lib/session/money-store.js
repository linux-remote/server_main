// not EXPIRE
// 当session为空时不生成文件。

const util = require('util');
const uid = require('uid-safe');

// const oneDayTime = 1000 * 60 * 60 * 24;
// let isStart = false;
const cache = Object.create(null);




function Store() {

  // opts = opts || Object.create(null);
  // this.ttlTime = opts.ttl || oneDayTime;
  
  // if(isStart){
  //   throw new Error('money-session-store just can be used once');
  // }
  // isStart = true;
}



Store.prototype.get = function(sid, callback){
  if (cache[sid]) {
    callback(null, cache[sid]);
  } else {
    callback(null, _getEmptySess());
  }
};

Store.prototype.set = function(sid, data, callback){
  console.log('set', cache);
  if(Object.keys(data).length === 1){ // {cookie: {}} 判断session为空，不存储。
    return callback();
  }
  
  // data._expires = Date.now() + this.ttlTime;

  cache[sid] = data;
  
  callback();

  // this._memoryTTL();
}

Store.prototype.destroy = function(sid, callback){
  delete(cache[sid]);
  console.log('Store.prototype.destroy', cache)
  callback && callback();
}

/*
let isMemoryTTL = false;
Store.prototype._memoryTTL = function() {
  if(isMemoryTTL){
    return;
  }
  isMemoryTTL = true;
  const self = this;
  const ttlTime = this.ttlTime;
  console.log('money-session-store memoryTTL start.');
  function loop(){
    setTimeout(function() {
      for(let i in cache){
        if(Date.now > cache[i]._expire){
          delete(cache[i]);
          self.emit('sessionTTLClear', i);
        }
      }
      if(Object.keys(cache).length === 0){
        console.log('money-session-store memoryTTL stop by empty.');
        isMemoryTTL = false;
      }else{
        loop();
      }
    }, ttlTime);
  }
  loop();
}
*/



//https://stackoverflow.com/questions/23327010/how-to-generate-unique-id-with-node-js
function ensureUniqueId() {
  const sid = uid.sync(24);
  console.log('ensureUniqueId', sid);
  if(!cache[sid]) {
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
  ensureUniqueId
}
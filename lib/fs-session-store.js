// not EXPIRE
// 当session为空时不生成文件。

var fs = require('fs');
var path = require('path');
var util = require('util');

var oneDayTime = 1000 * 60 * 60 * 24;

function Store(opts){
  this.dir = opts.dir;
  this.ttl = opts.ttl || oneDayTime;
  setInterval(()=> {
    this.clear();
  }, oneDayTime);

}
const cacheMaxAge = 1000 * 60 * 10;
const cache = Object.create(null);
global.SESSION_CACHE = cache;
setTimeout(function(){
  for(let i in cache){
    if(Date.now > cache[i]._expire){
      delete(cache[i]);
    }
  }
}, cacheMaxAge);

function isEqual(newSess, sid){
  const cacheSess = cache[sid];
  if(JSON.stringify(cacheSess.loginedMap) === JSON.stringify(newSess.loginedMap)){
    return true;
  }
  return false;
}
const geting = Object.create(null);

Store.prototype.get = function(sid, callback){
  if(cache[sid] && Date.now() < cache[sid]._expire){
    cache[sid]._expire = Date.now() + cacheMaxAge;
    callback(null, cache[sid]);
  }else {
    if(!geting[sid]){
      geting[sid] = [callback];
      fs.readFile(path.resolve(this.dir, sid), 'utf-8', function(err, result){
        if(err){
          if(err.code === "ENOENT"){
            // 不会自动创建 节省空间
            err = null;
            result = {cookie:{}};
  
          }
        }else{
          result = result ? JSON.parse(result) : {cookie:{}};
          cache[sid] = result;
          cache[sid]._expire = Date.now() + cacheMaxAge;
          console.log('get session by file.');
        }
        geting[sid].forEach(function(cb){
          cb(err, result);
        })
        delete(geting[sid]);
      })


    }else{
      geting[sid].push(callback);
    }
    


  }

};

Store.prototype.set = function(sid, data, callback){
  if(Object.keys(data).length === 1){ // 判断session为空，不存储。
    return callback();
  }
  if(cache[sid] && isEqual(data, sid)){
    cache[sid]._expire = Date.now() + cacheMaxAge;
    callback();
  }else{
    var fpath = path.resolve(this.dir, sid);
    fs.writeFile(fpath, JSON.stringify(data), {mode: 0o600},function(err){
      if(err){
        return callback(err);
      }
      cache[sid] = data;
      console.log('save session to file.');
      callback();
    });
  }
}

Store.prototype.destroy = function(sid, data, callback){
  delete(cache[sid]);
  fs.unlink(path.resolve(this.dir, sid), callback);
}


Store.prototype.clear = function(){
  var self = this;
  fs.readdir(self.dir, function(err, files){
    if(err) return console.error('fs session store clear readdir ' + self.dir + ' fail');
    let len = files.length, i = 0;
    var now = Date.now();
    for(; i < len; i++){
      var fpath = path.resolve(self.dir, files[i]);
      fs.stat(fpath, function(err, stat){
        if(err) return console.error('fs session store stat: ' + fpath + ' fail');
        var lastModifyTime = new Date(stat.mtime);
        lastModifyTime = lastModifyTime.getTime();

        if(now - lastModifyTime >= self.ttl){
          fs.unlink(fpath);
        }
      })
    }
  })
}

module.exports = function (session) {
  var defStore = session.Store;
  util.inherits(Store, defStore);
  return Store;
}

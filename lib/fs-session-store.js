// not EXPIRE
// 当session为空时不生成文件。

var fs = require('fs');
var path = require('path');
var util = require('util');

var oneDayTime = 1000 * 60 * 60 * 24;
var fileTTL_Id = null;
var isStart = false;

function Store(opts){
  this.dir = opts.dir;
  this.ttl = opts.ttl || oneDayTime;
  
  if(isStart){
    throw new Error('FsSessionStore just can be used once');
  }
  isStart = true;
  // console.log('FsSessionStore fileTTL start.');
  // this._fileTTL();
}

var memoryTTL_Id = null;
const cacheMaxAge = 1000 * 60 * 10;
const cache = Object.create(null);

function _memoryTTL(){
  memoryTTL_Id = setTimeout(function(){
    for(let i in cache){
      if(Date.now > cache[i]._expire){
        delete(cache[i]);
      }
    }
    if(Object.keys(cache).length === 0){
      console.log('FsSessionStore memoryTTL stop by empty.');
      clearTimeout(memoryTTL_Id);
      memoryTTL_Id = 0;
    }else{
      _memoryTTL();
    }
  }, cacheMaxAge);
}




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
          if(result.loginedMap){
            var o = Object.create(null);
            Object.keys(result.loginedMap).forEach(function(k){
              o[k] = result.loginedMap[k];
            });
            result.loginedMap = o;
          }
          cache[sid] = result;
          cache[sid]._expire = Date.now() + cacheMaxAge;
          //console.log('get session by file.');
          if(!memoryTTL_Id){
            console.log('FsSessionStore memoryTTL start by get session.');
            _memoryTTL();
          }
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
    let self = this;
    fs.writeFile(fpath, JSON.stringify(data), {mode: 0o600},function(err){
      if(err){
        return callback(err);
      }

      cache[sid] = data;
      console.log('save session to file.');

      callback();

      if(!fileTTL_Id){
        console.log('FsSessionStore fileTTL start by save session.');
        self._fileTTL();
      }
      
    });
  }
}

Store.prototype.destroy = function(sid, data, callback){
  delete(cache[sid]);
  fs.unlink(path.resolve(this.dir, sid), callback);
}


Store.prototype._fileTTL = function(){
  const self = this;
  const dir = self.dir;

  fs.readdir(dir, function(err, files){
    if(err){
      throw new Error('FsSessionStore readdir ' + dir + ' fail');
    }
    var len = files.length;
    if(!len && fileTTL_Id){
      clearTimeout(fileTTL_Id);
      fileTTL_Id = 0;
      console.log('FsSessionStore fileTTL stop by empty dir');
      return;
    }

    const sholdStatFileMap = Object.create(null);
    var sholdUnlinkFile = [];

    // get sholdStatFileMap
    files.forEach( fileName => {

      const arr = fileName.split('+');
      if(arr.length <= 2){ // sid 或 sid+username.suffix
        const sid = arr[0];
        const usernameAndSuffix = arr[1];
        if(!usernameAndSuffix){
          sholdStatFileMap[sid] = sholdStatFileMap[sid] || [];
        }else{
          if(sholdStatFileMap[sid]){
            sholdStatFileMap[sid].push(usernameAndSuffix);
          }else{
            sholdStatFileMap[sid] = sholdStatFileMap[sid] || [];
          }
        }
      }else{
        sholdUnlinkFile.push(path.resolve(dir, fileName));
      }

    });

    const now = Date.now();
    var stated = 0, statTotal = 0;
    for(let fileName in sholdStatFileMap){
      statTotal = statTotal + 1;
      let fpath = path.resolve(dir, fileName);

      fs.stat(fpath, function(err, stat){
        stated = stated + 1;
        if(err){
          throw new Error('fsSessionStore stat: ' + fpath + ' fail');
        }

        var lastModifyTime = new Date(stat.atime); //通过 atime(文件被读取时间 fs.readFile 会更新该时间) 判定过没过期. 
        lastModifyTime = lastModifyTime.getTime();

        if(now - lastModifyTime >= self.ttl){
          sholdUnlinkFile.push(fpath);
          sholdStatFileMap[fileName].forEach(usernameAndSuffix => {
            sholdUnlinkFile.push(fpath + '+' + usernameAndSuffix);
          })
        }

        if(stated === statTotal){
          unlinkRun();
        }
      })
    }

    
    function unlinkRun(){
      var unlinked = 0, total = sholdUnlinkFile.length;
      if(total === 0){
        done();
        return;
      }

      for(let i = 0; i < total; i++){
        fs.unlink(sholdUnlinkFile[i], function(err){
          if(err){
            throw new Error('fsSessionStore unlink ' + sholdUnlinkFile[i] + ' fail')
          }
          console.log('fsSessionStore fileTTL unlink ' + sholdUnlinkFile[i] + ' ok!');
          unlinked = unlinked + 1;
          if(unlinked === total){
            done();
          }
        })
      }
    }

    function done(){
      setTimeout(function(){
        self._fileTTL();
      }, oneDayTime)
    }
  })
}

module.exports = function (session) {
  var defStore = session.Store;
  util.inherits(Store, defStore);
  return Store;
}

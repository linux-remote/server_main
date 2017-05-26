//not EXPIRE

var fs = require('fs');
var path = require('path');
var util = require('util');

var oneDayTime = 1000 * 60 * 60 * 24;

function Store(opts){
  this.dir = opts.dir;
  this.ttl = opts.ttl || oneDayTime;
  // this.clerrCount = 0;
  // this.clerrCount = 0;
  //this.clearLogPath = path.resolve(this.dir, 'cleaner.log');
  setInterval(()=> {
    this.clear();
  }, oneDayTime);

}

// Store.prototype.getTTL = function(store, sess){
//   var maxAge = sess.cookie.maxAge;
//   return store.ttl || (typeof maxAge === 'number'
//     ? Math.floor(maxAge / 1000)
//     : oneDay);
// }
// Store.prototype.touch
// Store.prototype.destroy =  noop
// Store.prototype.ids = noop
// Store.prototype.all = noop

// 不会自动创建 节省空间
Store.prototype.get = function(sid, callback){
  //console.log('get');
  fs.readFile(path.resolve(this.dir, sid), 'utf-8', function(err, result){
    if(err){
      //console.log('get dont have session');
      return callback(null, {cookie:{}});
    };

    callback(null, JSON.parse(result));
  })
};

// Store.prototype.touch = function(sid, callback){
//   fs.readFile(path.resolve(this.dir, sid), 'utf-8', function(err, result){
//     if(err){
//       console.log('get dont have session');
//       return callback(null, {dontCreateSession: true, 
//         cookie: {
//           notHaveSession: true
//        }});
//     };

//     callback(null, JSON.parse(result));
//   })
// };

Store.prototype.set = function(sid, data, callback){
  //console.log('set', data);
  if(Object.keys(data).length === 1){
    console.log('session is empty not set it');
    return callback();
  }
  var fpath = path.resolve(this.dir, sid);
  fs.writeFile(fpath, JSON.stringify(data), function(err, result){
    callback(err, result);

    // var maxAge = data.cookie.maxAge;
    // if(data.cookie.maxAge){
      
    //   fs.utimes(fpath, );
    // }
  })
}

Store.prototype.destroy = function(sid, data, callback){
  fs.unlink(path.resolve(this.dir, sid), callback);
}

// Store.prototype.isMeClear = function(){
//   fs.readFile(this.clearLogPath, 'utf-8', function(err, result){

//     if(err){
//       var now = Date.now();
//       result = {
//         lastClearTime: Date.now()
//       }
//       fs.writeFile(this.clearLogPath, now.toString());
//     }
//   })
// }

Store.prototype.clear = function(){
  var self = this;
  fs.readdir(self.dir, function(err, files){
    if(err) return console.error('fs session store clear readdir '+ self.dir + ' fail');
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

// module.exports = function(opts){
//   return new Store(opts);
// };

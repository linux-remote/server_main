const fs = require('fs');
const DIR = global.SESSION_PATH;
const path = require('path');
const sas = require('sas');

const TTL = 60 * 1000 * 60 * 24; //一天
var  now;

function readDir(callback){
  fs.readdir(DIR, function(err, files){
    //return callback();
    if(err) callback(err);
    const obj = {};
    //const indexs = {};
    files.forEach( v => {
      const _path = path.join(DIR, v);
      const arr = v.split('+');
      const sid = arr[0];
      const name = arr[1];
      if(!name){
        obj[sid] = [_path, {}];
      }else{
        if(obj[sid]){
          obj[sid][1][name] = _path;
        }else{
          obj[v] = _path;
        }

      }
    });
    callback('$reload', obj);

    // files.forEach((i) => {
    //   files
    //   fs.stat(path.join(DIR, i), function(){
    //
    //   })
    //   console.log(i);
    // })

  })
}

function stat(_path){
  return function (callback, i){
    fs.stat(_path, function(err, stat){
      if(err) return callback(err);
      if(i.index === 0){
        const dateTime = (new Date(stat.mtime)).getTime();
        if(dateTime + TTL <= now){
          console.log('DELETE expire TMP FILE:', _path);
          fs.unlink(_path, callback);
        }else{
          return callback('$up');
        }
      }else{
        fs.unlink(_path, callback);
      }
      // const dateTime2 = (new Date(stat.ctime)).getTime();
      // console.log('mtime', dateTime, 'ctime', dateTime2);
      // console.log(_path, dateTime2 === dateTime);
      // if(dateTime + TTL <= now){
      //   console.log('DELETE expire TMP FILE:', _path);
      //   // sas({
      //   //   1: _path,
      //   //   2: _path +
      //   // })
      //   fs.unlink(_path, callback);
      // }else{
      //   callback();
      // }
    })
  }
}
//
// function clear(path){
//   fs.l
// }
function go(){
  now = Date.now();
  sas(readDir, {iterator: stat}, function(err){
    if(err){
      console.error('tmp ttl fail!');
      throw err;
    }
  });
  setTimeout(() => {
    go();
  }, TTL - 1000 * 10);
}

go();


// module.exports = function(){
//
// }

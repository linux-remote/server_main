const fs = require('fs');
const DIR = global.CONF.TMP_PATH;
const path = require('path');
const sas = require('sas');

const TTL = 60 * 1000 * 60 * 24;
var  now;

function readDir(callback){
  fs.readdir(DIR, function(err, files){
    if(err) throw err;
    callback('$reload', files);

    // files.forEach((i) => {
    //   files
    //   fs.stat(path.join(DIR, i), function(){
    //
    //   })
    //   console.log(i);
    // })

  })
}

function stat(fileName){
  return function (callback){
    const _path = path.join(DIR, fileName);

    fs.stat(_path, function(err, stat){
      if(err) return callback(err);
      const dateTime = (new Date(stat.mtime)).getTime();
      if(dateTime + TTL >= now){
        console.log('DELETE:', _path);
        fs.unlink(_path, callback);
      }else{
        callback();
      }
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
      //console.error(err);
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

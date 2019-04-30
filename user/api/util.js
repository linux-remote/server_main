const fs = require('fs');
function escapePath(str){
  str = str.replace(/\\/g, '\\\\');
  return str.replace(/"/g, '\\"'); 
}
// exports.escapePath = escapePath;

exports.wrapPath = function(str){
  str = escapePath(str);
  return `"${str}"`;
}

exports.fsGetOrInit = function (filePath, data, callback){
  fs.readFile(filePath, 'utf-8', function(err, result){
    if(err){
      if(err.code === "ENOENT"){
        fs.writeFile(filePath, data, function(err){
          if(err){
            return callback(err);
          }
          callback(null, data);
        });
      }else{
        callback(err);
      }
    }else{
      callback(null, result);
    }
  })
}


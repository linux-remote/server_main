var fs = require('fs');
var path = require('path');

function clear(dir, sid, callback) {
  fs.readdir(dir, function(err, files) {
    if(err) {
      return callback(err);
    }
    const len = files.length;
    const loopDel = (i) => {
      if(i >= len) {
        return;
      }
      const name = files[i];
      if(name.indexOf(sid) !== -1) {
        const filePath = path.join(dir, name);
        fs.unlink(filePath, function(err){
          if(err){
            return callback(err);
          }
          loopDel(i + 1);
        })
      }
    }
    loopDel(0);
  });
}
exports.clearOnTTL = clear;
exports.clearAll = function(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(name => {
    const filePath = path.join(dir, name);
    fs.unlinkSync(filePath);
  });
};

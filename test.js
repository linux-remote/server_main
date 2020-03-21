const fs = require('fs');
fs.stat('./package.json', function(err, stat){
  console.log(stat.mtime, stat.mtime.getTime().toString(16))
})
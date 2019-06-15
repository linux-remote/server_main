const fs = require('fs');
const filename = '/home/guest/abc.txt';
fs.watchFile(filename, { interval: 500 }, (curr, prev) => {
  console.log('curr', curr.mtime);
  console.log('prev', prev.mtime);
  if(curr.blksize) {
    fs.unwatchFile(filename);
  }
});

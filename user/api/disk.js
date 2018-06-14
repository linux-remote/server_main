// const os = require('os');
const {exec} = require('child_process');
const THEAD = ['source', 
  'fstype', 
  'size', 
  'used', 
  'itotal', 
  'iused', 
  'target']
const FIXED_LEN = THEAD.length - 1;
const CMD = 'df -k --output=' + THEAD.join(',');
// + ' --exclude-type=tmpfs --exclude-type=devtmpfs';

// const testStr = 
// `文件系统       类型       1K-块      已用  Inode 已用(I) 挂载点
// /dev/sda1      ext4     9156984   5494660 589824  284018 /
// common         vboxsf 248737076 156614724   1000       0 /mnt/common haha haha
// `
function parseLine(line){
  var len = line.length;
  var i = 0;
  var lineArr = [];
  var preIndex = 0;
  var isEmpty = false;
  for(; i < len; i++){
    if(/\s/.test(line[i])){
      if(!isEmpty){
        lineArr.push(line.substr(preIndex, i - preIndex));
        isEmpty = true; 
      }
    }else{
      if(isEmpty){
        if(lineArr.length === FIXED_LEN){
          lineArr.push(line.substr(i));
          break;
        }else{
          isEmpty = false;
          preIndex = i;
        }
      }
    }
  }
  return lineArr;
}

function parse(stdout){
  let lines = stdout.split('\n');
  lines.shift();
  lines.pop();
  return lines.map(line => {
    return parseLine(line);
  })
}
// const result = parse(testStr)
// //console.log(parse(testStr));
// console.log(result);
module.exports = function(req, res, next){
  exec(CMD, function(err, result){
    if(err){
      return next(err);
    }
    res.apiOk({
      head: THEAD,
      body: parse(result)
    })
  });
}


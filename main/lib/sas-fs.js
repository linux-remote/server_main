var sas = require('sas');
var fs = require('fs');
var path = require('path');
var sep = path.sep;

function getFsPath(arr){
  const arr2 = []
  for(let i = 0, len = arr.length; i < len; i++){
    if(typeof arr[i] !== 'number'){
      arr2.push(arr[i]);
    }
  }
  return arr2.join(sep);
}

function _mkTreeIte(data){
  return function(cb, t) {
    var fspath = getFsPath(t.indexs());
    fspath = path.join(this.dir, fspath);
    if (t.index === 0) { //根据this 的index 判定是否为目录
      fs.mkdir(fspath, cb);
    } else { //创建文件并写入。
      fs.writeFile(fspath, data, cb);
    }
  }
}

function mkTree(dir, data, callback){
  sas(data, {context: {dir}, iterator: _mkTreeIte}, callback);
}

// var plan = {
//   'linux-remote-data' :[null, {
//       '1': [null, {
//         '1-1': 'hello!1-1',
//         '1-2': 'hello!1-2',
//         '1-3': 'hello!1-3'
//       }],
//       '2': [null, {
//         '2-1': 'hello!2-1',
//         '2-2': 'hello!2-2',
//         '2-3': 'hello!2-3'
//       }],
//       '3': [null, {
//         '3-1': 'hello!3-1',
//         '3-2': 'hello!3-2',
//         '3-3': 'hello!3-3'
//       }]
//     }]
// }
// mkTree(__dirname, plan, function(){
//   console.log(arguments)
// })

module.exports = {
  getFsPath,
  mkTree
}

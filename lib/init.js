
// 主要用来生成ssl自签名证书的。


var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var sas = require('sas');
var sasFs = require('./sas-fs');
var $ssl = require('./ssl');

const CONF = global.CONF;
const DATA_PATH = CONF.DATA_PATH;
var initJSON = null;

function initDataDir(callback){
  // var tplDataFolder = path.join(__dirname, '../_tpl/' + CONF.DATA_FOLDER_NAME);
  // const cmd = `cp -r ${tplDataFolder} ${DATA_PATH}`;
  // console.log('init data path:', cmd);
  // exec(cmd, callback);

  const SSS_INDEX_DATA = JSON.stringify({
    "CAInit": false,
    "CN": "",
    "CADownloadedCount": 0
  });

  const INIT_JSON_DATA = JSON.stringify({
    "tmp": false
  });

  const TPL_DATA = {
    ".linux-remote-data": [null,
      {
        "ssl-self-signed": [null, {
          "index.json" : SSS_INDEX_DATA
        }],
        "init.json" : INIT_JSON_DATA
      }
    ]
  }

  sasFs.mkTree(path.dirname(DATA_PATH), TPL_DATA, callback)
}

function statDataDir(callback){
  fs.stat(DATA_PATH, function(err){
    if(err){
      if(err.code === 'ENOENT'){
        initDataDir(callback);
      }else{
        callback(err);
      }
    }else{
      callback();
    }
  })
}

function readInitJson(cb){arguments
  initJSON = require(DATA_PATH + '/init.json');
  cb();
}
function initTmpFolder(cb){
  if(initJSON.tmp){
    return cb();
  }
  const mkdir = cb => exec('mkdir -m=777 ' + CONF.TMP_PATH, cb);
  const chmod = cb => exec('chmod +t ' + CONF.TMP_PATH, cb);
  const writeInitJSON = function(cb){
    initJSON.tmp = true;
    fs.writeFile(DATA_PATH + '/init.json', JSON.stringify(initJSON), function(err){
      if(err){
        initJSON.tmp = false;
        cb(err);
      }else{
        cb();
      }
    })
  }
  sas([mkdir, chmod, writeInitJSON], cb);
}

module.exports = function(callback){
  sas([
    statDataDir,
    readInitJson,
    initTmpFolder,
    $ssl,
  ], callback);

}

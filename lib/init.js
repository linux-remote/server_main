
// 主要用来生成ssl自签名证书的。


var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var sas = require('sas');
var $ssl = require('./ssl');

const CONF = global.CONF;
const DATA_PATH = CONF.DATA_PATH;

function initDataDir(callback){
  var tplDataFolder = path.join(__dirname, '../_tpl/' + CONF.DATA_FOLDER_NAME);
  const cmd = `cp -r ${tplDataFolder} ${DATA_PATH}`;
  console.log('init data path:', cmd);
  exec(cmd, callback);
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




module.exports = function(callback){
  sas([
    statDataDir,
    $ssl,

  ], callback);

}

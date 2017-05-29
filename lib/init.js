
// 主要用来生成ssl自签名证书的。

var sas = require('sas');
var fs = require('fs');
var exec = require('child_process').exec;
var sss = require('ssl-self-signed');

var DATA_PATH = `${global.ROOT_PATH}/data`;

function mkDir(path){
  return function(callback){
    fs.mkdir(path, callback);
  }
}

function initIfNotHave(path){
  return function(callback){
    fs.stat(path, function(err, stat){
      if(err || !stat.isDirectory()){
        return callback('$reload', mkDir(path));
      }
      callback('$up');
    })
  }
}


function selfSignCert(callback){
  var {commonName, bit, CA, days} = global.CONF.sslSelfSigned;
  if(!CA){
    sss.getOrCreateCA(DATA_PATH, function(err, CA){
      global.CONF.sslSelfSigned.CA = CA;
      selfSignCert(callback);
    });
  }else{
    global.CONF.SSL_SELF_SIGN_CA_CERT_PATH = CA.cert;
    sss.getOrSign({
      output: DATA_PATH,
      commonName,
      bit,
      days,
      CA,
      end: callback
    });
  }
}

module.exports = function(callback){

  var sslConf = global.CONF.ssl;

  sas(initIfNotHave(DATA_PATH), function(err){
    if(err){
      exec(`rm -rf ${path}`, function(){
        callback(err);
      });
    }else if(sslConf === true){
      selfSignCert(callback);
    }else if(typeof sslConf === 'object'){
      sas({
        $key: cb => fs.readFile(sslConf.key, cb),
        $cert: cb => fs.readFile(sslConf.cert, cb)
      }, callback)

    }else{
      callback();
    }
  })
}



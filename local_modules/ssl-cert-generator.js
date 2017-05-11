/*
  1. 创建根证书的私匙
  openssl genrsa -out ca.key 2048

  2. 利用私钥创建根证书：
  openssl req -new -x509 -days 36500 -key ca.key -out ca.crt -subj \
  "/C=CN/ST=ST/L=L/O=O/OU=OU"

  3. 创建SSL证书私匙
  openssl genrsa -out server.key 2048

  4. 利用刚才的私匙建立SSL证书：
  openssl req -sha256 -new -key server.key -out server.csr -subj \
  "/C=CN/ST=ST/L=L/O=O/OU=OU/CN=ssl-cert-generator"

  6. 用CA根证书签署SSL自建证书:
  openssl ca -in server.csr -out server.crt -cert ca.crt -keyfile ca.key
*/
var fs = require('fs');
var exec = require('child_process').exec;
var sas = require('sas');
var path = require('path');
var fuckwinfsdel = require('fuckwinfsdel');

var commonName = 'ssl-cert-generator ' + Date.now();

var autoSSLDir = path.join(__dirname, '../.auto-ssl-cert');

//sas tasks
function touchDir(callback){
  fs.stat(autoSSLDir, function(err, stat){
    console.log('err', err)
    if(err && err.code === 'ENOENT'){
      return callback('$reload', mkdir);
    }
    
    callback(err || '$up');
  });
}

const mkdir = cb => fs.mkdir(autoSSLDir, cb);

const createCaKey  = cb => exec(`openssl genrsa -out ${autoSSLDir}/ca.key 2048`, cb);

const createCaCrt = cb => exec(
  `openssl req -new -x509 -days 36500 -key ${autoSSLDir}/ca.key -out ${autoSSLDir}/ca.crt -subj "/C=CN/ST=ST/L=L/O=O/OU=OU`,
  cb);

const createServerKey = cb => exec(`openssl genrsa -out ${autoSSLDir}/server.key 2048`, cb);

const createServerCsr = cb => exec(
  `openssl req -sha256 -new -key ${autoSSLDir}/server.key -out ${autoSSLDir}/server.csr -subj "/C=CN/ST=ST/L=L/O=O/OU=OU/CN=${commonName}"`, 
  cb);

const createServerCrt = cb => {
  var ls = exec(
  `openssl ca -in ${autoSSLDir}/server.csr -out ${autoSSLDir}/server.crt -cert ${autoSSLDir}/ca.crt -keyfile ${autoSSLDir}/ca.key`, 
  cb);
  ls.stdin.write('y\n');
  ls.stdin.write('y\n');
}
const clear = cb => {
  var ls = exec(
  `openssl ca -in ${autoSSLDir}/server.csr -out ${autoSSLDir}/server.crt -cert ${autoSSLDir}/ca.crt -keyfile ${autoSSLDir}/ca.key`, 
  cb);
  ls.stdin.write('y\n');
  ls.stdin.write('y\n');
}
sas([
  touchDir,
  {
    ca: [createCaKey, createCaCrt], 
    createServerKey
  },
  createServerCrt
], function(err){
  //console.log('err', err);
  if(err){ 
    fuckwinfsdel(autoSSLDir, function(){
      throw err;
    })
  }
})
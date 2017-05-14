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

/* output, bit */
var exec = require('child_process').exec;
var sas = require('sas');
var path = require('path');

function generator(opts, callback){

  var dir = (typeof opts === 'string') ? opts : opts.output;
  opts = opts || {};
  var bit = opts.bit || 2048;
  var commonName = 'ssl-cert-generator ' + Date.now();

  // var caKey = path.join(dir, 'ca.key');
  // var caCrt = path.join(dir, 'ca.crt');
  // var serverKey = path.join(dir, 'server.key');
  // var serverCsr = path.join(dir, 'server.csr');
  // var serverCrt = path.join(dir, 'server.crt');
  var caKey = path.resolve(dir, 'ca.key');
  var caCrt = path.resolve(dir, 'ca.crt');
  var serverKey = path.resolve(dir, 'server.key');
  var serverCsr = path.resolve(dir, 'server.csr');
  var serverCrt = path.resolve(dir, 'server.crt');

  const createCaKey  = cb => exec(`openssl genrsa -out ${caKey} ${bit}`, cb);

  const createCaCrt = cb => exec(
    `openssl req -new -x509 -days 36500 -key ${caKey} -out ${caCrt} -subj "/C=CN/ST=ST/L=L/O=O/OU=OU"`,
    cb);

  const createServerKey = cb => exec(`openssl genrsa -out ${serverKey} ${bit}`, cb);

  const createServerCsr = cb => exec(
    `openssl req -sha256 -new -key ${serverKey} -out ${serverCsr} -subj "/C=CN/ST=ST/L=L/O=O/OU=OU/CN=${commonName}"`, 
    cb);


  const createServerCrt = cb => {
    //cb()
    // setTimeout(function(){ //ERROR: events.js 163 read ECONNRESET

      var ls = exec(
      `openssl ca -in ${serverCsr} -out ${serverCrt} -cert ${caCrt} -keyfile ${caKey}`,
      cb);
    //   // ls.stdin.write('y\n');
    //   // ls.stdin.write('y\n');
    // })
  }

  sas([
    {
      ca: [createCaKey, createCaCrt], 
      createServerKey
    },
    createServerCsr,
    createServerCrt
  ], function(err){
    if(err) {
      return callback(err);
    }

    callback(null, {
      caKey,
      caCrt,
      serverKey,
      serverCrt,
      serverCsr
    })
  });
}


generator('./test', function(err, result){
  console.log('err2', err);
  console.log('\n');
  console.log('result', result);
});
module.exports = generator;

/*
//sas tasks
function touchDir(callback){
  fs.stat(dir, function(err, stat){
    console.log('err', err)
    if(err && err.code === 'ENOENT'){
      return callback('$reload', mkdir);
    }
    
    callback(err || '$up');
  });
}



const mkdir = cb => fs.mkdir(dir, cb);

const createCaKey  = cb => exec(`openssl genrsa -out ${dir}/ca.key 2048`, cb);

const createCaCrt = cb => exec(
  `openssl req -new -x509 -days 36500 -key ${dir}/ca.key -out ${dir}/ca.crt -subj "/C=CN/ST=ST/L=L/O=O/OU=OU`,
  cb);

const createServerKey = cb => exec(`openssl genrsa -out ${dir}/server.key 2048`, cb);

const createServerCsr = cb => exec(
  `openssl req -sha256 -new -key ${dir}/server.key -out ${dir}/server.csr -subj "/C=CN/ST=ST/L=L/O=O/OU=OU/CN=${commonName}"`, 
  cb);

const createServerCrt = cb => {
  var ls = exec(
  `openssl ca -in ${dir}/server.csr -out ${dir}/server.crt -cert ${dir}/ca.crt -keyfile ${dir}/ca.key`, 
  cb);
  ls.stdin.write('y\n');
  ls.stdin.write('y\n');
}

const readFlie = path => cb => fs.readFile(path, cb);




module.exports = function(callback){
  sas([
    touchDir,
    {
      ca: [createCaKey, createCaCrt], 
      createServerKey
    },
    createServerCsr,
    createServerCrt,
    {
      $key:readFlie(`${dir}/server.key`),
      $cert: readFlie(`${dir}/server.crt`)
    }
  ], function(err, result){
    //console.log('err', err);
    if(err){
      fuckwinfsdel(dir, function(){
        callback(err);
      });
    }else{
      callback(null, result);
    }
  })
}

*/

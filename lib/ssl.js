// 主要用来生成ssl自签名证书的。
var fs = require('fs');
var SSS = require('ssl-self-signed');
var sas = require('sas');

const CONF = global.CONF;
const DIR = CONF.DATA_PATH + '/ssl-self-signed';

module.exports = $ssl;

function $ssl(callback){
    if(CONF.ssl === true){
      selfSignCert(function(err){

        if(err) return callback(err);
        CONF.ssl = {
          key: DIR + '/server.key',
          cert: DIR + '/server.crt',
          caCertPath: '/CA.crt'
        }
        $ssl(callback);
      });  //自生成
    }else if(typeof CONF.ssl === 'object'){ //用户自己的证书
      sas({
        $key: cb => fs.readFile(CONF.ssl.key, cb),
        $cert: cb => fs.readFile(CONF.ssl.cert, cb)
      }, callback)
    }else{
      callback(); //http;
    }
}

function selfSignCert(callback){
  let sssConf = CONF.sslSelfSigned;
  if(!sssConf.commonName){
    throw new Error('CONF.sslSelfSigned need a commonName!');
  }

  fs.readFile(DIR + '/.index.json', 'utf-8', function(err, data){
    if(err) return callback(err);
    data = JSON.parse(data);

    if(data.CN !== sssConf.commonName){
      //init CA
      let CA = sssConf.CA;
      if(!CA){
        if(data.CAInit){
          CA = {
            key: DIR + '/CA.key',
            cert: DIR + '/CA.cert',
          }
        }
      }

      //generate
      var {commonName, bit, days, C, O} = sssConf;
      SSS({
        output: DIR,
        commonName,
        CA,
        bit,
        days,
        C,
        O,
        end(err){
          if(err) return callback(err);
          if(!sssConf.CA){
            data.CAInit = true;
            data.CN = commonName;
          }
          data = JSON.stringify(data);
          fs.writeFile(DIR + '/.index.json', data, callback);
        }
      })
    }else{
      callback();
    }
  });
}


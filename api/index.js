var CONF = global.CONF;
var {pick} = require('lodash');

exports.index = function(req, res, next){
  res.apiOk('hello world!');
}

exports.touch = function(req, res, next){
  let selfCA = null;
  if(CONF.ssl === true){
    selfCA =  global.CONF.SSL_SELF_SIGN_CA_CERT_PATH;
  }
  
  res.apiOk(sslSelfSigned);
}
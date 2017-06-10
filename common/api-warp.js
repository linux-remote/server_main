const middleWare = require('./middleware');
const util = require('./util');

module.exports = function apiWarp(app){

  app.response.__proto__.apiOk = function(data){
    this.json({
      code: 0,
      data
    })
  };

  app.response.__proto__.apiError = function(code, msg){
    middleWare.errHandle(util.codeErrWrap(code, msg), this.req, this);
  }
  
}

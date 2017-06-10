const middleWare = require('../common/middleWare');

exports.proxy = function(req, res, next){
  const loginedList = req.session.loginedList || [];
  //console.log('req.session', req.session);
  const username = req.params.username;
  if(loginedList.indexOf(username) === -1){
    return res.apiError(2);
  }
  next();
},
middleWare.proxy,
function(err, req, res){
  // err.code ECONNREFUSED 进程挂了
  // err.code ENOENT 目录没权限
  res.apiError(5);
  console.error('onError',err);
}

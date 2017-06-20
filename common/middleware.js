var util = require('./util');
var ONE_YEAR_SECOND  = 60 * 60 * 24 * 365;

exports.CORS = function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://127.0.0.1:4000');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method == "OPTIONS") {
    res.set('Access-Control-Max-Age', ONE_YEAR_SECOND);
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'content-type');
    res.send('ok');
  } else {
    next();
  }
}

// exports.needLogin = function(req, res, next) {
//   if (!req.session || !req.session.user) {
//     return res.status(403).send('<a href="/login">请先登录</a>');
//   }
//   next();
// };
//    //res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE', 'OPTIONS');

//404
exports.notFound = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}


//errHandle

exports.errHandle = function(err, req, res) {

  let msg = `${err.name}: ${err.message}`;
  let data;
  if(!err.isCodeError){
    var status = err.status || 500;
    res.status(status);
    data = msg;

  }else{
    var code = err.code || 1000;
    data = {
      code: code,
      msg
    }
  }
  console.log('next bottom', data)
  res.send(data);
  util.errLog(msg, req);
};
// } else {
//   exports.errHandle = function(err, req, res, next) {
//     const status = err.status || 500;
//     res.status(status);
//     let msg = `${err.name}: ${err.message}`;
//     if(status >= 500){
//       msg += `<pre>\n${err.stack}</pre>`
//     }
//     res.send(msg);
//     util.errLog(msg, req);
//   };
// }

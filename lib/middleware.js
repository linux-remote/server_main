var util = require('./util');

exports.CORS = function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://' + req.hostname + ':4002');
  res.set('Access-Control-Allow-Credentials', 'true');
  
  if (req.method == "OPTIONS") {
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'content-type');
    res.set('Access-Control-Max-Age', '99999999999');
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

//404
exports.notFound = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}


//errHandle 
if (process.env.NODE_ENV === 'production') {
  exports.errHandle = function(err, req, res, next) {
    res.status(err.status || 500);
    util.errLog(err, req);
    var data = {
      message: err.message,
      error: err
    }
    res.send(data);
  };
} else {
  exports.errHandle = function(err, req, res, next) {
    res.status(err.status || 500);
    util.errLog(err, req);
    var data = {
      message: err.message,
      name: err.name,
      error: err,
      stack: err.stack,
    }
    res.json(data);
  };
}
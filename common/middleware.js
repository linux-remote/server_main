var {preventUnxhr} = require('./util');
var ONE_YEAR_SECOND  = 60 * 60 * 24 * 365;

exports.CORS = function(req, res, next) {
  res.set('Access-Control-Allow-Origin', 'http://127.0.0.1:4000');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method == "OPTIONS") {
    res.set('Access-Control-Max-Age', ONE_YEAR_SECOND);
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
    res.send('ok');
  } else {
    next();
  }
}

exports.preventUnxhrMid = function(req, res, next){
  if(!preventUnxhr(req, res)){
    next();
  }
}

//404
exports.notFound = function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}

//errHandle
exports.errHandle = function(err, req, res, next) {

  let msg = `${err.name}: ${err.message}`;
  let data;
  if(!err.isCodeError){
    var status = err.status || 500;
    res.status(status);
    data = msg;
    // if(status === 500){
    //   console.error(err);
    // }
  }else{
    data = {
      code: err.code,
      msg
    }
  }

  res.send(data);
  //util.errLog(msg, req);
};

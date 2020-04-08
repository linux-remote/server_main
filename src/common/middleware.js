
const http = require('http');
var ONE_YEAR_SECOND  = 60 * 60 * 24 * 365;

const conf = global.CONF;
let isNotCORSVisit = function(){
  return false;
};

if(global.IS_PRO && !conf.__demo){
  isNotCORSVisit = function(req){
    if(req.origin === global.CONF.CORS){
      return false;
    }
    return true;
  }
}
exports.CORS = function(req, res, next) {
  // Prevent share link potential attack.
  if(isNotCORSVisit(req)){
    res.status(400).end('CORS: not allowed origin.');
    return;
  }
  res.set('Access-Control-Allow-Origin', global.CONF.CORS);
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method == "OPTIONS") {
    res.set('Access-Control-Max-Age', ONE_YEAR_SECOND);
    // Keep Simple Request;
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // GET, PUT, POST, DELETE, OPTIONS
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
    res.set('Access-Control-Allow-Headers', 'content-type');
    res.end('ok');
  } else {
    next();
  }
}

// Prevent share link potential attack.
exports.preventUnxhr = function(req, res, next){
  if(!req.xhr) {
    res.status(400).end("xhr only");
  } else {
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
  if(!err.status){
    console.error('errHandle', err.message);
  }
  //  else {
  //   console.error('errHandle', err.status, err.name, err.message);
  // }
  setTimeout(() => {
    if(req.complete){
      res.status(err.status || 400);
      res.end(err.message || http.STATUS_CODES[err.status] || '');
    } else {
      // eg: upload , stop immediately
      req.destroy();
    }
  });
};
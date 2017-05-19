var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if(global.CONF.ssl === true){
  var sslSelfSigned = global.CONF.sslSelfSigned;
  app.get('/downloadCACert/:key', function(req, res, next){
    if(req.params.key === sslSelfSigned.caCertDownloadUrlKey){
      res.sendFile(global.CONF.SSL_SELF_SIGN_CA_CERT_PATH);
    }else{
      next();
    }
  });
}

app.get('/', function(req, res){
  res.send('Hello Linux Remote!');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// http error handler
if(global.IS_PRO){
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    // render the error page
    res.status(err.status || 500);
    res.json(err);
  });
}else{
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json(err);
  });
}



module.exports = app;

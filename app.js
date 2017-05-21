var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var middleWare = require('./lib/middleWare');
var mountClient = require('./lib/mount-client');
var apiRouter = require('./api/router');
var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));
app.use(logger(global.IS_PRO ? 'pro' : 'dev'));

if(global.CONF.client){
  mountClient(app, client);
}else{
  app.use(middleWare.CORS);
}

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);

// http error handler
app.use(middleWare.errHandle);

module.exports = app;

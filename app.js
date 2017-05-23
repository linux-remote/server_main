var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var middleWare = require('./lib/middleWare');
var mountClient = require('./lib/mount-client');
var apiRouter = require('./api/router');
var app = express();
var CONF = global.CONF;

app.response.__proto__.apiOk = function(data){
  this.json({
    code: 0,
    data
  })
};

app.response.__proto__.apiError = function(code, msg){
  this.json({
    code,
    msg
  });
}

// uncomment after placing your favicon in /public
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));
app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));

if(CONF.client){
  mountClient(app, client);
}else{
  app.use(middleWare.CORS);
}

if(CONF.ssl === true){
  var sslSelfSigned = CONF.sslSelfSigned;
  app.get('/downloadCACert/:key', function(req, res, next){
    if(req.params.key === sslSelfSigned.caCertDownloadUrlKey){
      res.sendFile(CONF.SSL_SELF_SIGN_CA_CERT_PATH);
    }else{
      next();
    }
  });
}

app.get('/', function(req, res, next){
  res.send('Hello Linux Remote!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: CONF.sessionSecret,
    cookie: {
        httpOnly: true
    },
    // store: new MongoStore({
    //     url:"mongodb://"+conf.mongodb.host+':'+conf.mongodb.port+'/'+conf.mongodb.db
    //     ,username:conf.mongodb.username,password:conf.mongodb.password
    //     ,reapInterval:1000 * 60 * 60 * 12   // 12 小时清理一次.
    //     ,autoDestroy:1000 * 60 * 60 * 24 *2 // 没有maxAge的话,2天后将会被清理.
    // }),
    resave: true,
    saveUninitialized: true
}));


app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);

// http error handler
app.use(middleWare.errHandle);

module.exports = app;

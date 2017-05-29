var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SessStore = require('./lib/fs-session-store')(session);

var middleWare = require('./lib/middleWare');
var mountClient = require('./lib/mount-client');
var proxy = require('http-proxy-middleware');

var login = require('./api/login');

var app = express();
var CONF = global.CONF;

// uncomment after placing your favicon in /public
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));
app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));

app.use(session({
    secret: CONF.sessionSecret,
    name: 'main_sid',
    cookie: {
        path: '/api/user',
        httpOnly: true
    },
    store: new SessStore({
      dir: path.resolve(__dirname, 'data/session')
    }),
    resave: true,
    saveUninitialized: true
}));


app.use('/api/user', function(req, res, next){
  if(!req.session.loginedList){
    req.session.loginedList = [];
  }
  next();
});

var _ = require('lodash');
var util = require('./lib/util');

app.use('/api/user/:userName', 
function(req, res, next){
  const loginedList = req.session.loginedList;
  const userName = req.params.userName;
  var curlUser = _.find(loginedList, {userName});
  if(!curlUser){
    return next(util.codeErrWrap(2, userName + req.session.id));
  }

  req._proxyConfig = {
    port: curlUser.port,
    mainSid : req.session.id
  };

  next();

},
proxy({
    target: 'http://127.0.0.1:',
    router(req){
      var config = req._proxyConfig;

      return this.target + config.port;
    }
}));

app.response.__proto__.apiOk = function(data){
  this.json({
    code: 0,
    data
  })
};

// var util = require('./lib/util');
// app.response.__proto__.apiError = function(code, msg){
//   util.codeErrWrap(code, msg);
// }


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
  res.send('Hello! This is linux-Remote-server!');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// ============================login============================
const API_LOGIN_PATH = '/api/login';



app.get(API_LOGIN_PATH, login.loginedList);
app.post(API_LOGIN_PATH, login.login);
// ============================login end============================

// catch 404 and forward to error handler
app.use(middleWare.notFound);

// http error handler
app.use(middleWare.errHandle);

module.exports = app;

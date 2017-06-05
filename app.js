var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SessStore = require('./lib/fs-session-store')(session);
var fs = require('fs');

var middleWare = require('./lib/middleWare');
var mountClient = require('./lib/mount-client');
var proxy = require('http-proxy-middleware');
var util = require('./lib/util');

var app = express();
var CONF = global.CONF;

// uncomment after placing your favicon in /public
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));
app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));

app.response.__proto__.apiOk = function(data){
  this.json({
    code: 0,
    data
  })
};

app.response.__proto__.apiError = function(code, msg){
  middleWare.errHandle(util.codeErrWrap(code, msg), this.req, this);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: CONF.sessionSecret,
    name: 'main_sid',
    cookie: {
        //path: '/api',
        httpOnly: true
    },
    store: new SessStore({
      dir: CONF.TMP_PATH
    }),
    resave: true,
    saveUninitialized: true
}));

// ============================首页============================
if(!CONF.IS_PRO){
  app.get('/', function(req, res, next){
    const session = req.session;
    res.send('Hello! This is linux-Remote-server! \nsession.id=' + session.id + '\nsession:' + JSON.stringify(req.session));
  });
}
// ============================首页完============================

// ============================前端加载============================
// 测试环境是分开的。正式是合起来的。
if(CONF.client){
  mountClient(app, client);
}else{
  app.use(middleWare.CORS);
}
// ============================前端加载完============================

// ============================代理用户app============================
app.use('/api/user/:username',
function(req, res, next){
  const loginedList = req.session.loginedList || [];
  //console.log('req.session', req.session);
  const username = req.params.username;
  var curlUser = loginedList.indexOf(username);
  if(curlUser === -1){
    return next(util.codeErrWrap(2, username));
  }
  req._proxyPipeName = util.getTmpName(req.session.id, username) + '.sock'
  console.log('req._proxyPipeName', req._proxyPipeName);
  next();
},
middleWare.proxy,
function(err, req, res, next){
  res.apiError(5);
  console.error('onError',err);
});
// proxy({
//     target: 'http://unix:',
//     router(req){
//       return this.target + req._proxyPipeName + ':';
//     },
//     onError(err, req, res){
//       console.error('onError',err);
//       res.apiError(5);
//     }
// }));

// ============================代理用户app完============================

// ============================第一次下载CA 证书============================
var sslSelfSigned = CONF.sslSelfSigned;
sslSelfSigned._indexData = sslSelfSigned._indexData || {CADownloadedCount: 1};
app.post('/api/verifyDownloadCACert', function(req, res, next){
  if(req.body.key === sslSelfSigned.CACertFirstDownloadKey){
    res.apiOk('/downloadCACert/' + req.body.key);
  }else{
    res.apiError(3);
  }
});

app.get('/api/getDownloadCACertStatus', function(req, res, next){
  res.apiOk(sslSelfSigned._indexData.CADownloadedCount);
});

app.get('/api/downloadCACert/:key', function(req, res, next){
  var _indexData = sslSelfSigned._indexData;
  if(_indexData.CADownloadedCount === 1){
    return res.apiError(4);
  }
  if(req.params.key === sslSelfSigned.CACertFirstDownloadKey){

    res.download(CONF.ssl.caCertPath, function(){
      //需要检测是否为ROOT
      const indexPath = path.resolve(CONF.ssl.caCertPath, '../index.json');
      _indexData.CADownloadedCount = 1; //debug 0
      fs.writeFile(indexPath, JSON.stringify(_indexData), function(err){
        if(err){
          _indexData.CADownloadedCount = 0;
          return console.error('CACertFirstDownloadKey index更新失败！', err);
        }

        console.log('CACertFirstDownloadKey 已使用。');
      });
    });
  }else{
    res.apiError(3);
  }
});
// ============================第一次下载CA 证书 完============================


// ============================login============================

var login = require('./api/login');

app.get('/api/touch', login.touch);
app.post('/api/login', login.login);
app.post('/api/logout', login.logout);
// ============================login end============================

// catch 404 and forward to error handler
app.use(middleWare.notFound);

// http error handler
app.use(middleWare.errHandle);

module.exports = app;

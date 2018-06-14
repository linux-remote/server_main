const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sessMiddleware = require('./lib/sess-middleware');
const middleWare = require('./common/middleware');
const mountClient = require('./lib/mount-client');
const apiWarp = require('./common/api-warp');
const apiRouter = require('./api/router');

const app = express();
const CONF = global.CONF;

apiWarp(app);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

app.use(cookieParser());

app.use(sessMiddleware);

// ============================前端加载============================
// 测试环境是分开的。正式是合起来的。
if(CONF.client){
  mountClient(app, CONF.client);
}else{
  app.use(middleWare.CORS);
}

const bodyParserMiddleWare = bodyParser.json();
const sess = require('./api/sess');
const login = require('./api/login');

app.get('/api/touch', sess.touch);

app.post('/api/login', bodyParserMiddleWare, login.login);
app.post('/api/logout', bodyParserMiddleWare ,login.logout);

app.use(sess.verifyLogined);

//用户进程代理
const apiUser = require('./api/user');
app.use('/api/user/:username', apiUser.beforeProxy, apiUser.proxy);

app.use(bodyParserMiddleWare);
app.use(bodyParser.urlencoded({ extended: false }));

// index 欢迎页
if(!global.IS_PRO){

  app.use(logger('dev'));

  app.get('/', function(req, res){
    res.send('Hello! This is Linux Remote Server !');
  });
}

// 主进程API
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

module.exports = app;

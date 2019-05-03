const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sessMiddleware = require('./lib/session/middleware');
const middleWare = require('./common/middleware');
const mountClient = require('./lib/mount-client');
const apiRouter = require('./api/global/router');
const app = express();

app.disable('x-powered-by');
app.disable('trust proxy');
const CONF = global.CONF;

// uncomment after placing your favicon in /public

// ============================前端加载============================
// 测试环境是分开的。正式是合起来的。
if(CONF.client){
  mountClient(app, CONF.client);
}else{
  app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
  app.use(middleWare.CORS);
}

app.use(cookieParser());
app.use(sessMiddleware);



//用户进程代理
const apiUser = require('./api/user');
app.use('/api/user/:username', apiUser.beforeProxy, apiUser.proxy);


if(!global.IS_PRO){
  app.use(logger('dev'));

  // index 欢迎页
  app.get('/', function(req, res){
    res.send('Hello! This is Linux Remote Server!');
  });
}

const sess = require('./api/sess');

app.get('/api/touch', middleWare.preventUnxhr, sess.touch);

const login = require('./api/new-login');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/login', middleWare.preventUnxhr, login.login);
app.post('/api/logout', middleWare.preventUnxhr, login.logout);

app.use(sess.verifyLogined);

// 主进程API
app.use('/api', middleWare.preventUnxhr, apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

module.exports = app;

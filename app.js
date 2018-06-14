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
const login = require('./api/login');
const index = require('./api/index');
const verifyLogined = require('./api/verify-logined');



app.post('/api/login', bodyParserMiddleWare, login.login);
app.post('/api/logout', bodyParserMiddleWare ,login.logout);

app.use(verifyLogined);
app.get('/api/touch', index.touch);
//用户进程代理
const apiUser = require('./api/user');
app.use('/api/user/:username', apiUser.beforeProxy, apiUser.proxy);

app.use(bodyParserMiddleWare);
app.use(bodyParser.urlencoded({ extended: false }));

// index 欢迎页
if(!global.IS_PRO){

  app.use(logger('dev'));

  app.get('/', function(req, res){
    const session = req.session;
    res.send('Hello! This is linux-Remote-server! \nsession.id=' + session.id + '\nsession:' + JSON.stringify(req.session));
  });
}

// 主进程API
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

module.exports = app;

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
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));

app.use(cookieParser());

app.use(sessMiddleware);

if(CONF.client){
  mountClient(app, CONF.client);
}else{
  app.use(middleWare.CORS);
}

const apiUser = require('./api/user');
app.use('/api/user/:username', apiUser.beforeProxy, apiUser.proxy);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ============================前端加载============================
// 测试环境是分开的。正式是合起来的。


app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));
// index
if(!CONF.IS_PRO){
  app.get('/', function(req, res){
    const session = req.session;
    res.send('Hello! This is linux-Remote-server! \nsession.id=' + session.id + '\nsession:' + JSON.stringify(req.session));
  });
}

app.use('/getSession', function(req, res){
  // if(req.hostname !== '127.0.0.1'){
  //   return next({status: 403})
  // }
  res.json(req.session);
});
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

module.exports = app;

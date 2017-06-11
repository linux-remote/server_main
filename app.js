const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const SessStore = require('./lib/fs-session-store')(session);

const middleWare = require('./common/middleWare');
const mountClient = require('./lib/mount-client');
const apiWarp = require('./common/api-warp');
const apiRouter = require('./api/router');

const app = express();
const CONF = global.CONF;

apiWarp(app);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(global.ROOT_PATH, 'public', 'favicon.png')));
app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));

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

// index
if(!CONF.IS_PRO){
  app.get('/', function(req, res){
    const session = req.session;
    res.send('Hello! This is linux-Remote-server! \nsession.id=' + session.id + '\nsession:' + JSON.stringify(req.session));
  });
}

// ============================前端加载============================
// 测试环境是分开的。正式是合起来的。
if(CONF.client){
  mountClient(app, CONF.client);
}else{
  app.use(middleWare.CORS);
}

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

module.exports = app;
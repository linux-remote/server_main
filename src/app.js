"use strict";
const path = require('path');
const fs = require('fs');
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const middleWare = require('./common/middleware');
const { sessionMid } = require('./lib/session');
const login = require('./api/login');
const user = require('./api/user.js');
const conf = global.CONF;
const app = express();
app.set('trust proxy', conf.appTrustProxy);
app.set('x-powered-by', conf.xPoweredBy);

if(!global.IS_PRO){
  app.use(require('morgan')('dev'));
}

app.use(favicon(path.join(__dirname, '../logo_def.png')));

app.get('/', function(req, res){
  res.end('linux-remote server');
});

if(conf.CORS || 
  conf.__demo // Just for demo
  ){
  app.use(middleWare.CORS);
}

if(global.IS_PRO){
  app.use('/api', middleWare.preventUnxhr);
}
// else {
//   // require('linux-remote-client')(app, conf.client);
// }

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', sessionMid, bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.get('/api/loggedInList', login.loggedInList);
app.post('/api/login',  login.login);
app.post('/api/logout',  login.logout);
app.use('/api/user/:username', user);




if(!conf.CORS){
  const client = conf.client;
  let moduleName;
  if(client.cdn){
    moduleName = 'client-mount';
  } else {
    moduleName = 'client';
  }
  moduleName = '@linux-remote/' + moduleName;
  moduleName = require.resolve(moduleName, {
    paths: [global.__HOME_DIR__ + 'node_modules']
  });

  require(moduleName)(app, express.static, {
    cdn: client.cdn,
    clientVersion: global.__CLIENT_VERSION__,
    CORS: false
  });
}


// // 上传
// app.post('/api/user/:username/upload', function(req, res, next){
//   res.end(req.params.username + 'upload');
// });
// //用户进程代理  
// app.use('/api/user/:username', function(req, res, next){
//   res.end(req.params.username);
// });

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

module.exports = app;

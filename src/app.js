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
const app = express();
app.set('trust proxy', global.CONF.appTrustProxy);
app.set('x-powered-by', global.CONF.xPoweredBy);


let clientVersion;

if(!global.IS_PRO){
  clientVersion = 'dev';
  app.use(require('morgan')('dev'));
} else {
  let versionMap = fs.readFileSync(path.join(global.__HOME_DIR__ + '/.version-map.json'), 'utf-8');
  versionMap = JSON.parse(versionMap);
  clientVersion = versionMap['client'];
  versionMap = null;
}

app.use(favicon(path.join(__dirname, '../logo_def.png')));

if(global.CONF.CORS){
  app.get('/', function(req, res){
    res.end('Server CORS: ' + global.CONF.CORS);
  });
  app.use(middleWare.CORS);
}
else {
  if(global.IS_PRO){
    app.use('/api', middleWare.preventUnxhr);
  }
}

// else {
//   // require('linux-remote-client')(app, global.CONF.client);
// }

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', sessionMid, bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.get('/api/loggedInList', login.loggedInList);
app.post('/api/login',  login.login);
app.post('/api/logout',  login.logout);
app.use('/api/user/:username', user);




if(!global.CONF.CORS){
  const client = global.CONF.client;
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
    clientVersion,
    CORS: global.CONF.CORS
  });

}

if(!clientVersion){
  process.send({type: 'exit', data: 'Not has clientVersion.'});
  return;
}

global.__CLIENT_VERSION__ = clientVersion;

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

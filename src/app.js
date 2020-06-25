"use strict";
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const middleWare = require('./common/middleware');
const { sessionMid } = require('./lib/session');
const login = require('./api/login');
const user = require('./api/user.js');
const conf = global.CONF;
const app = express();

if(!global.IS_PRO){
  app.use(require('morgan')('dev'));
}

app.get('/favicon.ico', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=91104000'
  });
  res.status(410).end('Gone');
});

app.set('trust proxy', conf.appTrustProxy);

if(conf.CORS ){
  app.use(middleWare.CORS);
}

if(global.IS_PRO){
  app.use(global.__API_PATH__, middleWare.preventUnxhr);
}
// else {
//   // require('linux-remote-client')(app, conf.client);
// }

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(global.__API_PATH__, sessionMid, bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.get(global.__API_PATH__ + '/loggedInList', login.loggedInList);
app.post(global.__API_PATH__ + '/login', login.login);
app.post(global.__API_PATH__ + '/logout',  login.logout);
app.use(global.__API_PATH__ + '/user/:username', user);




if(!conf.CORS){
  const client = conf.client;
  let moduleName = 'client-mount';
  moduleName = '@linux-remote/' + moduleName;
  const nodeModuleDir = path.join(global.__HOME_DIR__, 'node_modules');
  moduleName = require.resolve(moduleName, {
    paths: [nodeModuleDir]
  });

  require(moduleName)(app, express.static, {
    cdn: client.cdn,
    clientVersion: global.__CLIENT_VERSION__,
    localunpkgdir: nodeModuleDir,
    CORS: false
  });
} else {
  app.get('/', function(req, res){
    res.end('LR Server CORS: ' + conf.CORS);
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

const path = require('path');
const fs = require('fs');
const express = require('express');
const logger = require('morgan');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const middleWare = require('./common/middleware');
const { sessionMid } = require('./lib/session');
const login = require('./api/login');
const user = require('./api/user.js');
const app = express();
let clientVersion;
app.set('trust proxy', global.CONF.appTrustProxy);
app.set('x-powered-by', global.CONF.xPoweredBy);

if(!global.IS_PRO){
  app.use(logger('dev'));
}

// if(global.CONF.client){
//   require('linux-remote-client')(app, global.CONF.client);
// }

// ============================ 前端加载 ============================
// 测试环境是分开的。正式是合起来的。
// if(global.CONF.client){
//   mountClient(app, global.CONF.client);
// }else{
//   app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
//   app.use(middleWare.CORS);
// }
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
// ============================ 前端加载结束 ============================


if(global.CONF.CORS){
  app.get('/', function(req, res){
    res.end('Server CORS: ' + global.CONF.CORS);
  });
  app.use(middleWare.CORS);
} else {
  if(global.IS_PRO){
    app.use(middleWare.preventUnxhr);
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


let projectPkg = fs.readFileSync(path.join(global.__HOME_DIR__ + '/package.json'), 'utf-8');
projectPkg = JSON.parse(projectPkg);

if(!global.CONF.CORS){
  const client = global.CONF.client;
  if(client.cdn){
    clientVersion = projectPkg._lrClientVersionCache;

    require('@linux-remote/client-mount')(app, express.static, {
      cdn: client.cdn,
      clientVersion,
      CORS: global.CONF.CORS
    });
  } else {
    clientVersion = projectPkg.dependencies['@linux-remote/client'];
    require('@linux-remote/client')(app, express.static, {
      clientVersion,
      CORS: global.CONF.CORS
    });
  }
} else {
  clientVersion = projectPkg._lrClientVersionCache;
}

if(!global.IS_PRO){
  clientVersion = 'dev';
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

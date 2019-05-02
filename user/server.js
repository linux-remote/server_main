const {execSync} = require('child_process');
const path = require('path');
const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const {onListening, onError, timeFormat} = require('../common/util');
const { FLAG } = require('../lib/util');
const ps = require('./api/ps');
const PORT = process.env.PORT;
execSync('rm -rf ' + PORT); //删除旧的 sock 文件, 才能启动.


const NODE_ENV = process.env.NODE_ENV;
global.IS_PRO = NODE_ENV === 'production';
const LR_PATH = path.join(process.env.HOME, 'linux-remote');
global.LR_PATH = LR_PATH;
global.DESKTOP_PATH = path.join(LR_PATH , 'desktop');
global.RECYCLE_BIN_PATH = path.join(LR_PATH , '.recycle-bin');

//初始化用户文件
execSync('mkdir -m=755 -p ' + global.DESKTOP_PATH);
execSync('mkdir -m=755 -p ' + global.RECYCLE_BIN_PATH);


const apiWarp = require('../common/api-warp');
const middleWare = require('../common/middleware');
const upload = require('./api/upload');
const terminal = require('./terminal');

var app = express();
app.disable('x-powered-by');
apiWarp(app);




var _ttpMin = 15;
if(!global.IS_PRO){
  app.use(logger('dev'));
  _ttpMin = 1000;
}
terminal(app);

app.use('/upload', middleWare.preventUnxhrMid, upload);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//================= 用户进程 TTL =================

const TTL_MAX_AGE = 1000 * 60 * _ttpMin;

var now = Date.now();

console.log('[Process TTL] start at: ' + 
            timeFormat() + 
            '  maxAge: ' + 
            ((TTL_MAX_AGE / 1000) / 60)  + 
            ' minute.');

const TTL = function(){
  setTimeout(() =>{
    if(Date.now() - now >= TTL_MAX_AGE){
      console.log('[Process TTL] process.exit by TTL end.' + timeFormat());
      normalExit();
    }else{
      TTL();
    }
  }, TTL_MAX_AGE);
}

app.use(function(req, res, next){
  now = Date.now();
  next();
});
//================= 用户进程 TTL end =================


app.get('/', function(req, res){
  var msg = 'Hello! this is linux-remote user server!';
  res.send(msg);
});

app.get('/live', function(req, res){
  res.send('Y');
});

const desktop = require('./api/desktop');

app.use('/desktop', middleWare.preventUnxhrMid, desktop);

// sys apps
const serverInfo = require('./api/server-info');
const recycleBin = require('./api/dustbin');
const fsApi = require('./api/fs');
const disk = require('./api/disk');

app.use('/fs', fsApi); // preventUnxhr inner.
const eStatic = require('express').static;
app.use('/fs', eStatic('/', {dotfiles: 'allow', maxAge: 0}));
app.get('/disk',middleWare.preventUnxhrMid, disk);
app.use('/serverInfo', middleWare.preventUnxhrMid, serverInfo);
app.use('/recycleBin', middleWare.preventUnxhrMid, recycleBin);
app.get('/ps', middleWare.preventUnxhrMid, ps);
app.delete('/exit', function(req, res){
  res.send('exit');
  res.on('finish', function(){
    console.log('User server exit!');
    normalExit();
  });
});

// catch 404 and forward to error handler
app.use(middleWare.notFound);
// http error handler
app.use(middleWare.errHandle);

var server = http.createServer(app);
server.listen(PORT);

server.on('listening', onListening(server, function(){
  execSync('chmod 600 ' + PORT);
  console.log(FLAG);
  TTL();
}));

server.on('error', onError);




function normalExit(){
  process.exit();
}

const { createPtyServer } = require('./pty');
createPtyServer(server);

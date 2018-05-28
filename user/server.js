const {execSync} = require('child_process');
const PORT = process.env.PORT;

if(/\.sock$/.test(PORT) === true){ //删除旧的 sock 文件, 才能启动.
  execSync('rm -rf ' + PORT);
  //console.log(`删除${PORT}文件成功！`);
}

const NODE_ENV = process.env.NODE_ENV;
global.IS_PRO = NODE_ENV === 'production';
global.DESKTOP_PATH = '~/linux-remote/desktop';
global.RECYCLE_BIN_PATH = '~/linux-remote/.recycle-bin';

//初始化用户文件
execSync('mkdir -m=755 -p ' + global.DESKTOP_PATH);
execSync('mkdir -m=755 -p ' + global.RECYCLE_BIN_PATH);

const http = require('http');
const express = require('express');
const logger = require('morgan');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiWarp = require('../common/api-warp');
const {onListening, onError} = require('../common/util');
const middleWare = require('../common/middleware');
const desk = require('./api/desk');
const fsApi = require('./api/fs');

var app = express();
apiWarp(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));

//================= 用户进程 TTL =================
const MAX_AGE = 1000 * 60 * 10;

var now = Date.now();
console.log('TTL start: ' + new Date(), 'MAX_AGE: ' + MAX_AGE);
const TTL = function(){
  setTimeout(() =>{
    if(Date.now() - now >= MAX_AGE){
      console.log('TTL end: ' + new Date());
      return process.exit();
    }else{
      TTL();
    }
  }, MAX_AGE);
}
TTL();

app.use(function(req, res, next){
  now = Date.now();
  next();
});
//================= 用户进程 TTL end =================


app.get('/', function(req, res){
  var msg = 'Hello! this is linux-remote user server!\n listen on ' + PORT + '\n';
  msg += 'pid: ' + process.pid;
  res.send(msg);
});

app.get('/live', function(req,res){
  res.send('Y');
});

app.use(desk);
app.use('/fs', fsApi);
//app.all('/exec', execApi);

app.delete('/exit', function(req, res){
  res.send('exit');
  res.on('finish', function(){
    console.log('User server exit!');
    process.exit();
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
  console.log('User server start!\n');
}));

server.on('error', onError);
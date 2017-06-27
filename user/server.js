const {execSync} = require('child_process');
const PORT = process.env.PORT;

if(/\.sock$/.test(PORT) === true){
  execSync('rm -rf ' + PORT);
  //console.log(`删除${PORT}文件成功！`);
}

const http = require('http');
const express = require('express');
const logger = require('morgan');
const desk = require('./api/desk');
const fsApi = require('./api/fs');
const execApi = require('./api/exec');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiWarp = require('../common/api-warp');
const {onListening, onError} = require('../common/util');
const COM_CONST = require('../common/const');
const os = require('os');
global.APP = {
  USER: os.userInfo()
};
Object.assign(global.APP, COM_CONST);

const NODE_ENV = process.env.NODE_ENV || 'development';
global.IS_PRO = NODE_ENV === 'production';

// var session = require('express-session');
// var cookieParser = require('cookie-parser');
// var sessStore = require('./lib/fs-session-store')(session);

var app = express();
apiWarp(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.get('/test500', function(req, res, next){
  next(new Error('test500'));
  process.exit();
});

app.get('/time', desk.time);
app.use(logger(global.IS_PRO ? 'tiny' : 'dev'));
// app.use(cookieParser());
const MAX_AGE = 1000 * 60 * 10;
// console.log('server start');
var now = Date.now();
console.log('TTL start: ' + now);
const TTL = function(){
  setTimeout(() =>{
    if(Date.now() - now >= MAX_AGE){
      console.log('TTL end: ' + Date.now());
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

app.get('/live', function(req,res){
  res.send('Y');
});

app.get('/', function(req, res){
  var msg = 'Hello! this is linux-remote user server!\n listen on ' + PORT + '\n';
  msg += 'pid: ' + process.pid;
  res.send(msg);
});

app.get('/info', desk.info);
app.use('/fs', fsApi);
app.all('/exec', execApi);

app.delete('/exit', function(req, res){
  res.send('exit');
  res.on('finish', function(){
    console.log('User server exit!');
    process.exit();
  });
});

var server = http.createServer(app);
server.listen(PORT);

server.on('listening', onListening(server, function(){
  execSync('chmod 600 ' + PORT);
  console.log('User server start!\n');
}));

server.on('error', onError);

//var PRE_EXIT_CODE = process.env.PRE_EXIT_CODE || ''
// function loop(){
//   let processCode = 0;
//   const ls = spawn(process.argv[0], [process.mainModule.filename], {
//     detached: true,
//     env: {
//       PRE_EXIT_CODE,
//       IS_WATCHER: true,
//       NODE_ENV: process.env.NODE_ENV,
//       PORT: process.env.PORT  || 3001
//     }
//     //,stdio: 'inherit'
//   });
//
//   ls.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });
//
//   ls.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });
//
//   ls.on('close', (code) => {
//     //fs.writeFileSync(path.join(__dirname ,'code.txt'), code);
//     if(code !== 0){
//       console.log(`exited code loop!`, arguments);
//       loop();
//     }else{
//       console.log(`child exit success!`);
//     }
//   });
// }
//
//
// if(!process.env.IS_WATCHER){
//   return loop();
// }
// app.get('/exit', function(req, res, next){
//   res.send('exit', null, function(){
//     console.log('exit');
//
//     //process.exit(1);
//   });
// });

// app.use('/api/user/:userName', session({
//     secret: global.CONF.sessionSecret,
//     name: 'user_sid',
//     cookie: {
//         baseUrlField: true,
//         httpOnly: true
//     },
//     store: new sessStore({
//       dir: path.resolve(__dirname, 'data/session')
//     }),
//     resave: true,
//     saveUninitialized: true
// }));

// app.get('/api/user/:userName', function(req, res, next){
//   var msg = '当前用户:' + req.params.userName;
//   var cookie = req.cookies;
//   msg += '\ncookie: ' + JSON.stringify(cookie);
//   msg += '\nsession' + JSON.stringify(req.session);
//   res.send(msg);
// });

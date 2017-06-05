var express = require('express');
var app = express();
var session = require('express-session');
var sessStore = require('./lib/fs-session-store')(session);
const path = require('path');
const http = require('http');
const execSync = require('child_process').execSync;

const PORT = process.env.PORT;



var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', function(req, res, next){
  var msg = 'Hello! this is linux-remote user server!\n listen on ' + PORT + '\n';
  msg += 'pid: ' + process.pid;

  res.send(msg);
});

app.get('/exit', function(req, res, next){
  res.send('exit', function(){
    process.exit();
  });
});

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



app.get('/api/user/:userName', function(req, res, next){
  var msg = '当前用户:' + req.params.userName;
  var cookie = req.cookies;
  msg += '\ncookie: ' + JSON.stringify(cookie);
  msg += '\nsession' + JSON.stringify(req.session);
  res.send(msg);
});


var server = http.createServer(app);
server.listen(PORT);
server.on('listening', onListening);

function onListening() {
  var addr = server.address();
  // var bind = typeof addr === 'string'
  //   ? 'pipe ' + addr
  //   : 'port ' + addr.port;
  console.log('Listening on pipe ' + addr);
  console.log('NODE_ENV ' + process.env.NODE_ENV);
  console.log('更改权限到600: ' + PORT);
  execSync('chmod 600 ' + PORT);
}

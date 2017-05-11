if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'development'
}
var NODE_ENV = process.env.NODE_ENV;

//两个全局变量
global.IS_PRO = NODE_ENV === 'production';
global.CONF = require('./conf/' + NODE_ENV);

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var routes = require('./routes')


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', function(req, res){
  res.send('Hello World!');
});
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// http error handler
if(global.IS_PRO){

  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}else{

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error');
  });
}



module.exports = app;

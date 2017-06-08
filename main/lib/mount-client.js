var path = require('path');

var static = require('express').static;

var DAY_TIME = 1000 * 60 * 60 * 24 //一天
var MONTH_TIME  = DAY_TIME * 30 //一月
var HALF_YEAR_TIME  = MONTH_TIME * 6; //半年 

module.exports = function(app, staticPath){
  //首頁不緩存
  app.get('/', static(staticPath)); 

  //lib 和 vendor 緩存半年
  app.get('/bulid/b_*', static(staticPath,{maxAge:halfYearTime}));

  //其它緩存一月
  app.use(static(staticPath,{maxAge:oneMonth}));

}
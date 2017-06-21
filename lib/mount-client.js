var path = require('path');

var eStatic = require('express').static;

var DAY_TIME = 1000 * 60 * 60 * 24 //一天
var MONTH_TIME  = DAY_TIME * 30 //一月
var HALF_YEAR_TIME  = MONTH_TIME * 6; //半年

module.exports = function(app, staticPath){
  console.log('staticPath', staticPath);
  //首頁不緩存
  app.get('/', eStatic(staticPath));

  // const DIR = path.dirname(staticPath);
  // console.log('DIR', DIR);
  //lib 和 vendor 緩存半年
  app.get('/bulid/b_*', eStatic(staticPath, {maxAge:HALF_YEAR_TIME}));

  //其它緩存一月
  app.use(eStatic(staticPath, {maxAge:MONTH_TIME}));

  //app.get('*', eStatic(staticPath));

}

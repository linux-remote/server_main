var eStatic = require('express').static;
const path = require('path');
var DAY_TIME = 1000 * 60 * 60 * 24 //一天
var MONTH_TIME  = DAY_TIME * 30 //一月
var HALF_YEAR_TIME  = MONTH_TIME * 6; //半年

module.exports = function(app, dir){
  const distPath = path.join(dir , '/dist/pro');
  //首頁不緩存
  app.get('/', eStatic(distPath));

  //lib 和 vendor 緩存半年
  app.get('/bulid/b_*', eStatic(distPath, {maxAge:HALF_YEAR_TIME}));
  //其它緩存一月
  app.use(eStatic(distPath, {maxAge:MONTH_TIME}));

  const publicPath = path.join(dir , '/public');
  app.use('/public', eStatic(publicPath, {maxAge:MONTH_TIME}));
}

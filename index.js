
if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'development'
}
var NODE_ENV = process.env.NODE_ENV;

var conf = require('./conf/' + NODE_ENV);

module.exports = function(userConf){
  conf = Object.assign(conf, userConf);
  global.IS_PRO = process.env.NODE_ENV === 'production';
  global.ROOT_PATH = __dirname;
  global.CONF = conf;

  require('./bin/www');
}
var devConf = require('./development')
var conf = {
  https: true,
  wss: true
}

module.exports = Object.assign(devConf, conf);
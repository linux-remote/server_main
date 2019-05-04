// const EventEmitter = require('events');
const path = require('path');
const util = require('../common/util');
const { FLAG, ERROR_FLAG } = require('./util');
// const start = new EventEmitter();
const APP_PATH = global.CONF.userServerMain;

function startUserServer(term, mainSid, username, callback) {
  const tmpName = util.getTmpName(mainSid, username);
  // var logName;
  // if(global.IS_PRO){
  //   logName = '/dev/null';
  // } else {
  //   logName = `${tmpName}.log`;
  // }
  const PORT = `${tmpName}.sock`;

  // var cmd = `NODE_ENV=${process.env.NODE_ENV} PORT=${PORT}`;
  // cmd =  `${cmd} ${process.argv[0]} ${APP_PATH} >${logName} 2>>${tmpName}-err.log`;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  let cmd = `NODE_ENV=${NODE_ENV} PORT=${PORT} ${process.argv[0]} ${APP_PATH}`;
  if(!global.IS_PRO) {
    cmd = `cd ${path.dirname(APP_PATH)} && NODE_ENV=${NODE_ENV} PORT=${PORT}  nodemon --ignore test/ -e js -L ${path.basename(APP_PATH)}`;
    term.addListener('data', function(data) {
      process.stdout.write(data);
    });
  }

  term.write(cmd + '\n');

  let handleTermData = (data) => {
    if(data.indexOf(FLAG) !== -1) {
      term.removeListener('data', handleTermData);
      callback && callback();
    } else if(data.indexOf(ERROR_FLAG) !== -1){
      callback && callback(true);
      term.removeListener('data', handleTermData);
    }
  }
  term.addListener('data', handleTermData);
}

module.exports = startUserServer;

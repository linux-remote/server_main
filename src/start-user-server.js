// const EventEmitter = require('events');
// const path = require('path');
const { getTmpName } = require('./session');
const { FLAG, ERROR_FLAG } = require('./util');
// const start = new EventEmitter();
const APP_PATH = global.CONF.userServerPath;

// term server;

function startUserServer(term, newSidHash, username, callback) {
  const tmpName = getTmpName(newSidHash, username);
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

// const EventEmitter = require('events');
const path = require('path');
const util = require('../common/util');
const { FLAG } = require('./util');
// const start = new EventEmitter();
const APP_PATH = path.join(__dirname, '../user/watcher.js');

function startUserServer(term, mainSid, username) {
  const tmpName = util.getTmpName(mainSid, username);
  var logName;
  if(global.IS_PRO){
    logName = '/dev/null';
  } else {
    logName = `${tmpName}.log`;
  }
  const PORT = `${tmpName}.sock`;

  // var cmd = `NODE_ENV=${process.env.NODE_ENV} PORT=${PORT}`;
  // cmd =  `${cmd} ${process.argv[0]} ${APP_PATH} >${logName} 2>>${tmpName}-err.log`;
  let cmd = `PORT=${PORT} ${process.argv[0]} ${APP_PATH}`;
  console.log('cmd', cmd);
  term.write(cmd + '\n');
  let output2 = '';
  let handleTermData = (data) => {
    output2 += data;
    console.log('out', data);
    if(data === FLAG) {
      console.log('启动服务成功。');
      term.removeListener('data', handleTermData);
    }
  }
  setTimeout(() => {
    term.addListener('data', handleTermData);
  }, 200)
  
}

module.exports = startUserServer;

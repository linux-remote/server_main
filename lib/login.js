const Client = require('ssh2').Client;
const path = require('path');
const chalk = require('chalk');
const util = require('../common/util');
const codeErrWrap = util.codeErrWrap;
const DATA_SPLITER = 'USER-SERVER-CREATED';
const fs = require('fs');
//const request = require('request');

const APP_PATH = path.join(__dirname, '../user/watcher.js');
const PWD = path.dirname(APP_PATH);

function enter(opts){
  const username = opts.username;
  const password = opts.password;
  const mainSid = opts.mainSid;
  const callback = opts.end;

  const tmpName = util.getTmpName(mainSid, username);
  const PORT = `${tmpName}.sock`;

  var outData = '';
  var isGetPid = false;
  var loopCount = 0;
  var cmd = `NODE_ENV=${global.CONF.NODE_ENV} PORT=${PORT}`;
  cmd =  `${cmd} nohup node ${APP_PATH} >${tmpName}.log 2>${tmpName}-err.log &`;
  //console.log(chalk.green('\ncmd\n' + cmd));

  const conn = new Client();
  conn.connect({
    host: '127.0.0.1',
    port: 22,
    username,
    password
  });

  function loop(){
    loopCount ++ ;
    setTimeout(function(){
      fs.stat(PORT, function(err){
        if(!err){
          callback(null);
        }else if(loopCount > 10){
          return callback(new Error('loopCount out'));
        }else {
          loop();
        }
      })
    },500);
  }

  conn.on('ready', function() {

    conn.shell(function(err, stream) {
      if (err) return callback(err);
      stream.write(`cd ${PWD}\n`);
      stream.write(cmd + '\n');
      stream.write(`echo ${DATA_SPLITER}\n`);

      stream.on('data', function(data) {
        if(isGetPid){
          return;
        }
        outData += data;
        var arr = outData.split('\n' + DATA_SPLITER);
        //console.log(chalk.red(arr.length));
        if(arr.length === 2){
          isGetPid = true;
          // get Pid
          // outData = arr[0];
          // outData = outData.split(/\n/);
          // var len = outData.length;
          // var pid = outData[len - 2];
          // pid = pid.trim();
          // pid = pid.split(' ')[1];
          // console.log('create User success.pid: ', pid, new Date());
          //get Pid end
          stream.end('exit\n');
          const logCmd = chalk.green(`tail -f ${tmpName}.log ${tmpName}-err.log`);
          console.log(`\nUser process is create, View log:\n${logCmd}\n`);

          loop();

        }

      });

    // .stderr.on('data', function(data) {
    //   });

      // function(code, signal)
      stream.on('close', function() {
        conn.end();
      });

    });

    // setTimeout(function(){
    //   console.log('\noutData:\n', outData);
    // }, 5000);

  })

  // conn.on('close', function(){
  //   console.log('ssh conn close.', arguments);
  // });

  conn.on('error', callback);
}

/**
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 * @api public
 */
module.exports = function(username, password, mainSid, callback){

  //ssh 会throw Error , 所以在这校验一下
  if(typeof username !== 'string' || !username){
    return callback(codeErrWrap(1, 'Invalid username: ' + username));
  }
  if(typeof password !== 'string' || !password){
    return callback(codeErrWrap(1, 'Invalid password: ' + password));
  }

  var opts = {
    username,
    password,
    mainSid,
    end: callback
  }
  enter(opts);
};

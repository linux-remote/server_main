const Client = require('ssh2').Client;
const path = require('path');
const chalk = require('chalk');
const request = require('request');
const util = require('../common/util');
const {execSync} = require('child_process');
const fs = require('fs');
const LOOP_MAX_COUNT = 15;
const codeErrWrap = util.codeErrWrap;
const APP_PATH = path.join(__dirname, '../user/watcher.js');

function enter(opts){
  const username = opts.username;
  const password = opts.password;
  const mainSid = opts.mainSid;
  const callback = opts.end;

  const tmpName = util.getTmpName(mainSid, username);
  var logName;
  if(global.IS_PRO){
    logName = '/dev/null';
  } else {
    logName = `${tmpName}.log`;
  }
  const PORT = `${tmpName}.sock`;

  var loopCount = 0;
  var cmd = `NODE_ENV=${process.env.NODE_ENV} PORT=${PORT}`;
  cmd =  `${cmd} nohup ${process.argv[0]} ${APP_PATH} >${logName} 2>>${tmpName}-err.log &`;
  console.log('cmd', cmd)
  const conn = new Client();
  conn.connect({
    host: '127.0.0.1',
    port: global.CONF.sshPort,
    username,
    password
  });

  function loop(){
    loopCount ++;
    setTimeout(function(){
      request.get('http://unix:' + tmpName + '.sock:/live', function(err){
        if(!err){
          conn.end();
          callback(null);
        }else if(loopCount > LOOP_MAX_COUNT){
          conn.end();

          fs.readFile(`${tmpName}-err.log.bak`, 'utf-8', function(err2, errLog){
            if(err2){
              //console.error('user proxy get errlog Error: ', err2);
              if(err2.code === 'ENOENT'){ //  watcher 没有启动。
                const ERROR_LOG_PATH = `${tmpName}-err.log`;
                fs.readFile(ERROR_LOG_PATH, 'utf-8', function(err3, errLog2){
                  if(err3){
                    callback(err3); 
                  }else{
                    errLog2 = errLog2 ? 'User process can not start-up!\n\nError log is:\n=================\n' + 
                    errLog2 + 
                    '\n=================\nYou need to make sure everyone is accessible to "' +
                    process.argv[0] +
                    '"' : 'Logining timeout, Please retry.'
                    execSync('cat /dev/null > ' + ERROR_LOG_PATH); //清空 error log.
                    callback(new Error(errLog2));
                  }
                });
              }else{
                callback(err2); 
              }
            }else {
              errLog = errLog ? 'User process start-up fail!\n\nError log is:\n=================\n' + 
              errLog + 
              '\n=================\nYou can report it at: https://github.com/linux-remote/linux-remote/issues' : 'Logining timeout, Please retry.'
              callback(new Error(errLog));
            }
          })

        }else {
          loop();
        }
      });
    },500);
  }

  conn.on('close', function(){
    const logCmd = chalk.green(`tail -f ${logName} ${tmpName}-err.log`);
    console.log(`\nUser process is create, View log:\n${logCmd}\n`);
    console.log(chalk.yellow('conn close'));
  });

  conn.on('error', function(err){
    console.log(chalk.yellow('conn error'));
    callback(err);
  });

  conn.on('ready', function() {
    console.log(chalk.yellow('conn ready'));
    conn.exec(cmd, function(err, stream){
      if (err) return callback(err);
      stream.on('data', function(data){
        console.log('STDOUT: ' + data);
      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
      });
      stream.on('close', function(code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        loop();
      })
    })
    return;
  })
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
    return callback(codeErrWrap(1, ' username: ' + username));
  }
  if(typeof password !== 'string' || !password){
    return callback(codeErrWrap(1, ' password: ' + password));
  }

  var opts = {
    username,
    password,
    mainSid,
    end: callback
  }
  enter(opts);
};

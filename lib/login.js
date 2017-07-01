const Client = require('ssh2').Client;
const path = require('path');
const chalk = require('chalk');
const util = require('../common/util');
const codeErrWrap = util.codeErrWrap;
// const DATA_SPLITER = 'USER-SERVER-CREATED';
// const fs = require('fs');
// const PWD = path.dirname(APP_PATH);
const request = require('request');

const APP_PATH = path.join(__dirname, '../user/watcher.js');


function enter(opts){
  const username = opts.username;
  const password = opts.password;
  const mainSid = opts.mainSid;
  const callback = opts.end;

  const tmpName = util.getTmpName(mainSid, username);
  const PORT = `${tmpName}.sock`;

  // var outData = '';
  // var isGetPid = false;
  var loopCount = 0;
  var cmd = `NODE_ENV=${global.CONF.NODE_ENV} PORT=${PORT}`;
  cmd =  `${cmd} nohup ${process.argv[0]} ${APP_PATH} >${tmpName}.log 2>${tmpName}-err.log &`;

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
      request.get('http://unix:' + tmpName + '.sock:/live', function(err){
        if(!err){
          conn.end();
          callback(null);
        }else if(loopCount > 10){
          //loopCount = 0;
          conn.end();
          return callback(new Error('loopCount out'));
        }else {
          loop();
        }
      });
    },500);
  }

  conn.on('close', function(){
    const logCmd = chalk.green(`tail -f ${tmpName}.log ${tmpName}-err.log`);
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
    //
    // conn.shell(function(err, stream) {
    //   console.log(chalk.yellow('conn shell'));
    //   if (err) return callback(err);
    //
    //   // return stream.end('exit\n');
    //   // setTimeout(() => {
    //   //   stream.write(`cd ${PWD}\n`);
    //   //   stream.write(cmd + '\n');
    //   //   stream.write(`echo ${DATA_SPLITER}\n`);
    //   // });
    //   stream.end('exit\n');
    //   stream.on('data', function(data) {
    //     if(isGetPid){
    //       return;
    //     }
    //     outData += data;
    //     var arr = outData.split('\n' + DATA_SPLITER);
    //     if(arr.length === 2){
    //       isGetPid = true;
    //       // get Pid
    //       // outData = arr[0];
    //       // outData = outData.split(/\n/);
    //       // var len = outData.length;
    //       // var pid = outData[len - 2];
    //       // pid = pid.trim();
    //       // pid = pid.split(' ')[1];
    //       // console.log('create User success.pid: ', pid, new Date());
    //       //get Pid end
    //       stream.end('exit\n');
    //       const logCmd = chalk.green(`tail -f ${tmpName}.log ${tmpName}-err.log`);
    //       console.log(`\nUser process is create, View log:\n${logCmd}\n`);
    //
    //       loop();
    //       //callback(null);
    //     }
    //
    //   })
    //
    //   stream.stderr.on('data', function(data) {
    //     console.log('stream stderr', chalk.red(data))
    //   });
    //
    //   // function(code, signal)
    //   stream.on('close', function() {
    //     console.log(chalk.red('stream close'));
    //     callback(null);
    //     conn.end();
    //   });
    //   setTimeout(() => {
    //     console.log(chalk.red('outData'), outData);
    //   }, 5000 )
    // });

    // setTimeout(function(){
    //   console.log('\noutData:\n', outData);
    // }, 5000);

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

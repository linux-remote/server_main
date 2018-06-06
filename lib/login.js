const Client = require('ssh2').Client;
const path = require('path');
const chalk = require('chalk');
const request = require('request');

const util = require('../common/util');

const codeErrWrap = util.codeErrWrap;
const APP_PATH = path.join(__dirname, '../user/watcher.js');

function enter(opts){
  const username = opts.username;
  const password = opts.password;
  const mainSid = opts.mainSid;
  const callback = opts.end;

  const tmpName = util.getTmpName(mainSid, username);
  const PORT = `${tmpName}.sock`;

  var loopCount = 0;
  var cmd = `NODE_ENV=${process.env.NODE_ENV} PORT=${PORT}`;
  cmd =  `${cmd} nohup ${process.argv[0]} ${APP_PATH} >${tmpName}.log 2>${tmpName}-err.log &`;

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
          conn.end();
          return callback(codeErrWrap(2));
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

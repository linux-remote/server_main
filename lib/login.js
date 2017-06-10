const Client = require('ssh2').Client;
const path = require('path');
var util = require('../common/util');
const codeErrWrap = util.codeErrWrap;
const DATA_SPLITER = 'USER-SERVER-CREATED';

var APP_PATH = path.join(__dirname, '../user-server.js');
var START_CMD = 'supervisor -w user, user-server.js, common '

function enter(opts){
  var username = opts.username;
  var password = opts.password;
  var mainSid = opts.mainSid;
  var callback = opts.end;

  var outData = '';
  var isGetPid = false;
  var tmpName = util.getTmpName(mainSid, username);
  var cmd = `NODE_ENV=${global.CONF.NODE_ENV} PORT=${tmpName}.sock`;
  //var cmd =  `${cmd} nohup node ${APP_PATH} >${tmpName}.log 2>${tmpName}-err.log &`;
  cmd =  `${cmd} ${START_CMD} ${APP_PATH}`;
  console.log('cmd', cmd);

  var conn = new Client();
  conn.connect({
    host: '127.0.0.1',
    port: 22,
    username,
    password
  });

  conn.on('ready', function() {

    conn.shell(function(err, stream) {
      if (err) return callback(err);
      stream.write('pwd\n');
      stream.write(cmd + '\n');
      stream.write(`echo ${DATA_SPLITER}\n`);

      stream.on('data', function(data) {
        if(isGetPid){
          return;
        }
        outData += data;
        var arr = outData.split('\n' + DATA_SPLITER);
        //console.log(arr.length)
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
          callback(null);
        }

      });

    // .stderr.on('data', function(data) {
    //   });

      // function(code, signal)
      stream.on('close', function() {
        conn.end();
      });

    });

    setTimeout(function(){
      console.log('\noutData:\n', outData);
    }, 5000);

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
    return callback(codeErrWrap(1, 'login ssh2. Invalid username: ' + username));
  }
  if(typeof password !== 'string' || !password){
    return callback(codeErrWrap(1, 'login ssh2: Invalid password: ' + password));
  }

  var opts = {
    username,
    password,
    mainSid,
    end: callback
  }
  enter(opts);
  // freeport(function(err, port){
  //   if(err){
  //     return callback(err);
  //   }

  // });
};

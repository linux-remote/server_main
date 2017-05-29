var Client = require('ssh2').Client;
var freeport = require('freeport');
var exec = require('child_process').exec;
var path = require('path');
var codeErrWrap = require('./util').codeErrWrap;

const DATA_SPLITER = 'USER-SERVER-CREATED';
  
var APP_PATH = path.join(__dirname, './test_user_server.js');

function enter(opts){

  var username = opts.username;
  var password = opts.password;
  var callback = opts.end;
  var port = opts.port;

  var outData = '';
  var isGetPid = false;

  var cmd = `NODE_ENV=${global.CONF.NODE_ENV} PORT=${port} nohup node ${APP_PATH} >/dev/null 2>nohuplog &`;
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
        outData = arr[0];
        outData = outData.split(/\n/);
        var len = outData.length;
        var pid = outData[len - 2];
        pid = pid.trim();
        pid = pid.split(' ')[1];
        console.log('create User success.pid: ', pid, new Date());
        //get Pid end
        stream.end('exit\n');
        callback(null, port);
      }
      
    })
    // .stderr.on('data', function(data) {
    //   });

      stream.on('close', function(code, signal) {
        conn.end();
      });

    });

  })

  // conn.on('close', function(){
  //   console.log('ssh conn close.', arguments);
  // });

  conn.on('error', callback);
};



/**
 * Re-loads the session data _without_ altering
 * the maxAge properties. Invokes the callback `fn(err)`,
 * after which time if no exception has occurred the
 * `req.session` property will be a new `Session` object,
 * although representing the same session.
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 * @api public
 */
module.exports = function(username, password, callback){

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
    end: callback
  }
  freeport(function(err, port){
    if(err){
      return callback(err);
    }
    opts.port = port;
    enter(opts);
  })

};

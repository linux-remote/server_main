var Client = require('ssh2').Client;
var freeport = require('freeport');
const chalk = require('chalk');
var exec = require('child_process').exec;
var path = require('path');

const DATA_SPLITER = 'GET-USER-SERVER-PID';
  
var APP_PATH = path.join(__dirname, './test.js');

function enter(opts){

  var username = opts.username;
  var password = opts.password;
  var callback = opts.end;
  var port = opts.port;

  var outData = '';
  var isGetPid = false;

  var cmd = `NODE_ENV=${global.CONF.NODE_ENV} PORT=${port} nohup node ${APP_PATH} >/dev/null 2>nohuplog &`;

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
        
      //get Pid
      if(isGetPid){
        return;
      }
      outData += data;
      var arr = outData.split('\n' + DATA_SPLITER);
      //console.log(arr.length)
      if(arr.length === 2){
        isGetPid = true;
        outData = arr[0];
        outData = outData.split(/\n/);
        var len = outData.length;
        var pid = outData[len - 2];
        pid = pid.trim();
        pid = pid.split(' ')[1];
        stream.end('exit\n');
        callback(null, {pid, port});
      }
      //get Pid end

    })
    // .stderr.on('data', function(data) {
    //     console.log(chalk.red('STDERR: ' + data));
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

enter({
      username: 'dw',
      password: '1',
      end: function(err, result){
        console.log('err', err);
        console.log('pid', result, result.length);
      }
    });



module.exports = function(opts){
  freeport(function(err, port){
    if(err){
      return opts.end(err);
    }
    opts.port = port;
    enter(opts);
  })
};

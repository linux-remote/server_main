var Client = require('ssh2').Client;
const DATA_SPLITER = 'GET-USER-SERVER-PID';
const chalk = require('chalk');

function enter(opts){

  var username = opts.username;
  var password = opts.password;
  var callback = opts.end;

  var path = require('path');
  var testFilePath = path.join(__dirname, './test.js');

  var outData = '';
  var isGetPid = false;

  var cmd = 'PORT=8000 nohup node ' + testFilePath + ' &';

  var conn = new Client();

  conn.connect({
      host: '127.0.0.1',
      port: 22,
      username: 'dw',
      password: '1'
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
        callback(null, pid);
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
      host: '127.0.0.1',
      port: 22,
      username: 'dw',
      password: '1',
      end: function(err, result){
        console.log('err', err);
        console.log('pid', result, result.length);
      }
    });
module.exports = enter;

// console style like nodemon.

const {spawn, execSync} = require('child_process');
const watch = require('watch');
const path = require('path');
const request = require('request');

const PORT = process.env.PORT;
const BASE_PATH = PORT.substr(0, PORT.lastIndexOf('.'));
const ERROR_LOG_PATH = BASE_PATH + '-err.log';

const IS_PRO = process.env.NODE_ENV === 'production';


// "chalk" is can't work in `tail -f` on my computer. So..
var _COLOR_MAP = {red: 31, green: 32, yellow: 33};
function _colorLog(style, str) {
  console.log('\u001b[' + _COLOR_MAP[style] + 'm' + str + '\u001b[39m');
}

var child, fileIsChange = false;

function _watch(dir){
  watch.watchTree(dir, {interval: 1}, function(f){
    if(typeof f !== 'object'){
      console.log('file changed')
      if(f === process.mainModule.filename){
        return; // 此文件
      }
      fileIsChange = true;
      child.kill();
    }
  });
}

var handleChildCrash;

if(IS_PRO){

  (function() {
    const liveUrl = 'http://unix:' + process.env.PORT + ':/live';
    var isCheckServerLive = false;
    function checkServerLive(){
      if(isCheckServerLive) return;
      loop();
      isCheckServerLive = true;
      var count = 0;
      function _loop(){
        count ++ ;
        _colorLog('yellow', '[Watcher] checkServerLive: ' + count);
        setTimeout(() => {
          request.get(liveUrl, err => {
            if(!err){
              isCheckServerLive = false;
              _colorLog('green', '[Watcher] checkServerLive: OK');
            }else if(count === 10){
              _colorLog('red', '[Watcher] checkServerLive Timeout. Watcher exit.');
              console.error('EXIT_BY_CHECK_SERVER_LIVE_TIMEOUT');
              process.exit();
            }else{
              _loop();
            }
          })
        }, 500);
      }
      _loop();
    }

    handleChildCrash = checkServerLive;

  })();

} else {

  _watch(__dirname);
  _watch(path.join(__dirname, '../common'));

  (function() {
    let isWaitFileChange = false;
    function loopWhenFileChange(){
      if(fileIsChange){
        isWaitFileChange = false;
        _colorLog('green', '[Watcher] restarting due to changes...');
        loop();
        fileIsChange = false;
      } else {
        if(!isWaitFileChange){
          _colorLog('red', '[Watcher] Process is crash! wait for File Change to restart...');
          isWaitFileChange = true;
        }
        setTimeout(loopWhenFileChange, 1000);
      }
    }
  
    handleChildCrash = loopWhenFileChange;
  })();

}

// NODE_ENV=development PORT=/opt/linux-remote/session/a9jt2OL63LVIev42wsvliqEWwWgSlcb1+dw.sock nodemon -L watcher.js

function loop(){
  child = spawn(process.argv[0], ['server.js'], {
    detached: true,
    cwd:__dirname,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if(code !== 0){
      execSync('cat ' + ERROR_LOG_PATH + ' > ' + ERROR_LOG_PATH + '.bak'); //error 备份.
      execSync('cat /dev/null > ' + ERROR_LOG_PATH); //清空 error log.
      handleChildCrash();
    }else{
      _colorLog('green', `[Watcher] Child exit success! Watcher exit. \t ${new Date()}`);
      execSync('rm -rf ' + PORT);
      execSync('rm -rf  ' + ERROR_LOG_PATH); //清空 error log.
      execSync('rm -rf  ' + ERROR_LOG_PATH + '.bak'); //清空 error log 备份.
      process.exit(); // 正常退出
    }
  });
}

loop();



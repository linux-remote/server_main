// console style like nodemon.

const {spawn} = require('child_process');
const watch = require('watch');
const path = require('path');
const {_colorLog, timeFormat} = require('../common/util');
const request = require('request');


const IS_PRO = process.env.NODE_ENV === 'production';

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

// var firstIsHandleStderr = false;
// var childStdErred = false;
// var loopCount = 0;
function loop(){
  child = spawn(process.argv[0], ['server.js'], {
    detached: true,
    cwd:__dirname,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if(code !== 0){
      // if(loopCount === 0 && childStdErred){
      //   _colorLog('red', `[Watcher] Child exit success! Watcher exit. \t ${timeFormat()}`);
      //   process.exit();
      // }
      handleChildCrash();
    }else{
      _colorLog('green', `[Watcher] Child exit success! Watcher exit. \t ${timeFormat()}`);
      process.exit(); // 正常退出
    }
  });
}

loop();



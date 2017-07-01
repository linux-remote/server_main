const {spawn} = require('child_process');

// if(!process.env.IS_NOT_FIRST){
//   process.env.IS_NOT_FIRST = true;
//   const child = spawn(process.argv[0], [process.mainModule.filename], {
//     detached: true,
//     stdio: 'ignore'
//   });
//   child.unref();
//   return;
// }

// console.log('process.env.IS_NOT_FIRST', process.env.IS_NOT_FIRST);
//
// console.log('process.argv[0]', process.argv[0]);
var ls;
const watch = require('watch');
const path = require('path');
function _watch(dir){
  watch.watchTree(dir, {interval: 1}, function(f){
    if(typeof f !== 'object'){
      console.log('watch file reload');
      ls.kill('__WATCH_FILE_RELOAD__');
    }
  });
}

if(process.env.NODE_ENV !== 'production'){
  _watch(__dirname);
  _watch(path.join(__dirname, '../common'));
}

function loop(){
  ls = spawn(process.argv[0], ['server.js'], {
    detached: true,
    cwd:__dirname,
    stdio: 'inherit'
  });

  // ls.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  //
  // ls.stderr.on('data', (data) => {
  //   console.log(`stderr: ${data}`);
  // });

  ls.on('close', (code) => {
    if(code !== 0){
      //console.log(`exited code loop!`, arguments);
      loop();
      checkServerLive();
    }else{
      console.log(`child exit success!`);
      process.exit();
    }
  });
}
loop();

const request = require('request');
const liveUrl = 'http://unix:' + process.env.PORT + ':/live';
const chalk = require('chalk');

var isCheckServerLive = false;
function checkServerLive(){
  if(isCheckServerLive) return;
  isCheckServerLive = true;
  var count = 0;
  function _loop(){
    count ++ ;
    console.log(chalk.red('checkServerLive', count));
    setTimeout(() => {
      request.get(liveUrl, err => {
        if(!err){
          isCheckServerLive = false;
          console.log(chalk.green('checkServerLive: OK'));
        }else if(count === 10){
          console.log(chalk.red('checkServerLive: process.exit'));
          process.exit();
        }else{
          _loop();
        }
      })
    }, 1000);
  }
  _loop();
}

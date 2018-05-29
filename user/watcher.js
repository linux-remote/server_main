const {spawn} = require('child_process');
const watch = require('watch');
const path = require('path');
const request = require('request');
const chalk = require('chalk');

const isPro = process.env.NODE_ENV === 'production';

var child;
function _watch(dir){
  watch.watchTree(dir, {interval: 1}, function(f){
    if(typeof f !== 'object'){
      console.log('watch file reload');
      child.kill();
    }
  });
}

if(!isPro){
  _watch(__dirname);
  _watch(path.join(__dirname, '../common'));
}

function loop(){
  child = spawn(process.argv[0], ['server.js'], {
    detached: true,
    cwd:__dirname,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if(code !== 0){
      loop();
      checkServerLive();
    }else{
      console.log(`child exit success! \t ${new Date()}`);
      process.exit();
    }
  });
}

loop();

const liveUrl = 'http://unix:' + process.env.PORT + ':/live';
var isCheckServerLive = false;
function checkServerLive(){
  if(!isPro){
    return;
  }
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

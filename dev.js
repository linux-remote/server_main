// watch file change and  restart server.

const { spawn, exec } = require('child_process');
const path = require('path');
const watch = require('watch');

// _console style like nodemon.
// "chalk" is can't work in `tail -f` on my computer. So..
let _COLOR_MAP = {red: 31, 
  // green: 32, 避免跟 nodemon 冲突.
  yellow: 33, 
  cyan: 96};
function _colorLog(style, str) {
  console.info('\u001b[' + _COLOR_MAP[style] + 'm' + str + '\u001b[39m');
}

function _watchTree(dir, onChange){
  watch.watchTree(dir, {
    interval: 1, 
    ignoreDotFiles: true,
    ignoreDirectoryPattern: /node_modules/
  }, function(f){
    if(typeof f !== 'object'){
      onChange(f);
    }
  });
}

let child, 
  fileIsChange = false,
  isWaitFileChange = false;

function _watch(dir){
  _watchTree(dir, function(f){
    if(typeof f !== 'object'){
      console.info('[watcher]file changed');
      if(f === process.mainModule.filename){
        return; // 此文件
      }
      fileIsChange = true;
      child.kill();
    }
  });
}

function handleChildCrash(){
  if(fileIsChange){
    isWaitFileChange = false;
    _colorLog('cyan', '[Watcher] restarting due to changes...');
    loop();
    fileIsChange = false;
  } else {
    if(!isWaitFileChange){
      _colorLog('red', '[Watcher] Process is crash! wait for File Change to restart...');
      isWaitFileChange = true;
    }
    setTimeout(handleChildCrash, 1000);
  }
}
const LR_SERVER_PATH = path.join(__dirname, './index.js');
function loop(){
  child = spawn(process.argv[0], [path.join(__dirname, '../session-store/index.js')], {
    env: {
      LR_SERVER_PATH,
      LR_USER_SERVER_PATH: path.join(__dirname, '../user-server/dev.js'),
      LR_LOGIN_BIN_PATH: '/opt/linux-remote/bin/lr-login'
    },
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if(code !== 0){
      handleChildCrash();
    }else{
      _colorLog('cyan', `[Watcher] Child exit success! Watcher exit. \t ${new Date()}`);
      process.exit(); // 正常退出
    }
  });
}

_watch(path.join(__dirname, '../session-store/src'));
loop();

_watchTree(path.join(__dirname, './src'), function(f){
  console.info('[lr-server] file changed', f);

  reloadServer();
});

function reloadServer(){
  exec('ps U linux-remote | grep ' + LR_SERVER_PATH, function(err, stdout){
    if(err){
      console.error('reloadServer error: ', err.message);
      return;
    }
    if(stdout){
      let pid = stdout.trim();
      if(pid){
        let i = pid.indexOf(' ');
        pid = pid.substr(0, i);
        console.log('reloadServer pid: ', pid);
        exec('kill ' + pid, function(err){
          if(err){
            console.error('[lr-server] reloadServer kill error: ', err.message);
            fileIsChange = true;
            child.kill();
          }
        })
      }
    }

  })
}


const {execSync} = require('child_process');
const os = require('os');
const path = require('path');

try{
  global.SESSION_PATH = '/dev/shm/linux-remote';
  execSync('mkdir -m=1777 -p ' + global.SESSION_PATH);
}catch(e) {
  global.SESSION_PATH = path.join(os.tmpdir(), 'linux-remote');
  execSync('mkdir -m=1777 -p ' + global.SESSION_PATH);
}

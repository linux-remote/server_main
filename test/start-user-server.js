const login = require('../lib/new-login');
const startUserServer = require('../lib/start-user-server');
global.SESSION_PATH = '/dev/shm/linux-remote';
const term = login({
  username: 'remote',
  password: '2',
  ip: '192.168.56.1',
  end(err) {
    if(err){
      console.log('登录失败', err.message);
    } else {

      console.log('登录成功'); // removeListener
      startUserServer(term, 'test-sid', 'remote')
    }
  }
});

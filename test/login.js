const login = require('../lib/new-login');

login({
  username: 'remote',
  password: '2',
  ip: '192.168.56.1',
  end(err) {
    if(err){
      console.log('登录失败');
    } else {
      console.log('登录成功.');
    }
  }
});

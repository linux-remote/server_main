const path = require('path');
const login = require('../lib/new-login');
// const { DebounceTime } = require('../lib/debounce-time');
const serverPath = path.join(__dirname, 'user-server.js');
const { FLAG } = require('./util');
const term = login({
  username: 'remote',
  password: '2',
  ip: '192.168.56.1',
  end(err) {
    if(err){
      console.log('登录失败', err.message);
    } else {

      console.log('登录成功'); // removeListener
      term.write('node ' + serverPath + '\n');

      // let output = '', handleTermData;
      // let debounce = new DebounceTime(() => {
      //   if(output.lastIndexOf(FLAG) !== -1) {
      //     console.log('启动服务成功。');
      //   }
      //   term.removeListener('data', handleTermData);
      // }, 200);
      
      let handleTermData = (data) => {
        if(data === FLAG) {
          console.log('启动服务成功。');
          term.removeListener('data', handleTermData);
        }
        // output = output + data;
        // debounce.trigger();
      }
      term.addListener('data', handleTermData);
    }
  }
});

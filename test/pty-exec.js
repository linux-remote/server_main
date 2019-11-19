const {ptyExec} = require('../lib/pty-exec');
ptyExec('guest', 'whoami', '123', (result) => {
  console.log(result);
})
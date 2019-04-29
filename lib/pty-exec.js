const pty = require('node-pty');
function roopWarp(cmd){
  return `su nobody -c "${cmd}" --shell="/bin/sh"`
}
function preventInjection(userInput) {
  return userInput.replace(/\n|\r|`|"|'/g, (mstr) => {
    // `str` 会执行
    switch(mstr) {
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      default:
        return '\\' + mstr;
    }
  });
}

function exec(username, cmd, passwd, callback) {
  let _cmd = `su '${preventInjection(username)}' --command='${cmd}'`;
  _cmd = roopWarp(_cmd);
  console.log('cmd:', _cmd);

  const term = pty.spawn('/bin/sh', ['-c', _cmd], {
    cols: 1000,
    rows: 200,
    cwd: process.env.PWD,
    env: process.env
  });
  let isFirstWrite = true;
  let result = '';
  term.on('data', function(data) {
    result += data;
    if(isFirstWrite) {
      // setTimeout ?
      term.write(preventInjection(passwd) + '\n');
      isFirstWrite = false;
    }
  });
  // let error;
  // term.on('error', function(err) {
  //   // May get Error: read EIO 
  //   // https://github.com/Microsoft/node-pty/issues/214
  //   if(err.message !== 'read EIO'){
  //     error = err;
  //   }
  //   // console.log('term', term);
  //   console.error('term error', err.message);
  // });

  term.on('exit', function(){
    if (callback) {
      const i = result.indexOf('\n');
      result = result.substr(i + 1);
      callback(result.trim());
    }
  })
}
exec('gue`whoami`st', 'whoami', '123', function(out){
  console.log('out', out);
});


module.exports = exec;

const pty = require('node-pty');
const {disinfect, safeWrap} = require('./disinfect');

// function roopWarp(cmd){
//   return `su nobody -c "${cmd}" --shell="/bin/sh"`
// }


function exec(username, cmd, passwd, callback) {
  let _cmd = `su ${safeWrap(disinfect(username))} --command=${safeWrap(disinfect(cmd))} -l`;
  // _cmd = roopWarp(_cmd);
  // console.log('cmd:', _cmd);

  const term = pty.spawn('sh', ['-c', _cmd], {
    cwd: process.env.PWD,
    env: process.env
  });
  let isFirstWrite = true;
  let result = '';
  term.on('data', function(data) {
    result += data;
    if(isFirstWrite) {
      // setTimeout ?
      term.write(disinfect(passwd) + '\n');
      isFirstWrite = false;
    }
  });

  // May get Error: read EIO 
  // https://github.com/Microsoft/node-pty/issues/214
  // So not error param.
  // let error;
  // term.on('error', function(err) {
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


module.exports = {
  ptyExec: exec
}
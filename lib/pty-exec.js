const pty = require('node-pty');
function roopWarp(cmd){
  return `su nobody -c "${cmd}" --shell="/bin/sh"`
}

function escapeInjection(userInput) {
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

function escapeCRLF(userInput) {
  return userInput.replace(/\n|\r|`/g, (mstr) => {
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
  let _cmd = `su '${escapeInjection(username)}' --command='${cmd}' -l`;
  _cmd = roopWarp(_cmd);
  // console.log('cmd:', _cmd);

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
      term.write(escapeInjection(passwd) + '\n');
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

exports.escapeCRLF = escapeCRLF;
exports.escapeInjection = escapeInjection;
exports.exec = exec;

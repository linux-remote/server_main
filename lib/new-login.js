
const pty = require('node-pty');
const { DebounceTime } = require('./debounce-time');
const { getFirstLine } = require('./util');
const { escapeInjection, escapeCRLF } = require('./pty-exec');

function login(opts) {
  const username = escapeInjection(opts.username);
  const term = pty.spawn('login', ['-h', opts.ip, username]);
  const callback = opts.end;

  let isEnd = false;
  function end(err, output) {
    if(isEnd) { // term on Error: may have read EIO bug.
      return;
    }
    isEnd = true;

    if(err) {
      term.kill();
      callback(err);
    } else {
      callback(err, output);
    }
  }

  const BEFORE_PROCESS = term.process;
  let output = '', isNotHaveOutput = true;

  const debunce = new DebounceTime(function() {
    if(isNotHaveOutput) {
      isNotHaveOutput = !output.trim();
    }
    if(isNotHaveOutput){ // waiting
      return;
    }
    if(BEFORE_PROCESS !== term.process) {
      end(null, output);
    } else {
      end({
        name: 'loginError',
        message: getFirstLine(output)
      });
    }
    term.removeListener('data', handleData);
  }, 200);
  
  function handleData(data) {
    output = output + data;
    debunce.trigger();
  }
  term.once('data', function() {
    // if(data === 'Password: ') {

    const password = escapeCRLF(opts.password);
    term.write(password + '\n');
    term.addListener('data', handleData);
    
    
    // } else { // 不会执行 
    //   end(true);
    // }
  });
  term.on('error', end);
  
  return term;
}


module.exports = login;

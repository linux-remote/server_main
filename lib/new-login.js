
const pty = require('node-pty');
const { DebounceTime } = require('./util');

const { escapeInjection, escapeCRLF } = require('./pty-exec');

function login(opts) {
  const username = escapeInjection(opts.username);
  const term = pty.spawn('login', ['-h', opts.ip, username]);
  const callback = opts.end;

  function end(err) {
    if(err) {
      term.kill();
    }
    callback(err);
  }

  const beforeProcess = term.process;
  let output = '';
  const debunce = new DebounceTime(function() {
    if(beforeProcess !== term.process) {
      term.removeListener('data', handleData);
      end(false);
    } else {
      end(true);
    }
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
  return term;
}


module.exports = login;

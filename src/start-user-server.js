
const { getTmpName } = require('./session');
const { FLAG, ERROR_FLAG } = require('./util');

// term server;
function startUserServer(term, newSidHash, username, callback) {
  const tmpName = getTmpName(newSidHash, username);

  const PORT = `${tmpName}`;

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const cmd = `NODE_ENV=${NODE_ENV} PORT=${PORT} ${process.argv[0]} ${global.CONF.userServerPath}`;

  let isEnd = false;
  let timer;
  function end(err) {
    if(timer){
      clearTimeout(timer);
    }
    if(isEnd) {
      return;
    }
    isEnd = true;
    if(err){
      term.kill();
      callback(err);
    } else {
      callback(null);
    }
  }

  term.write(cmd + '\n');

  let handleTermData = (data) => {
    if(data.indexOf(FLAG) !== -1) {
      term.removeListener('data', handleTermData);
      end(null);
    } else if(data.indexOf(ERROR_FLAG) !== -1){
      end(new Error('[linux-remote-user-server]: Start-up fail.'));
    }
    // timeout ?
  }

  term.addListener('data', handleTermData);
  timer = setTimeout(function(){
    end(new Error('[linux-remote-user-server]: Start-up timeout.'));
  }, 5000);
}

module.exports = startUserServer;

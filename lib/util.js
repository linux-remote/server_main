// on Sep 22, 2018 copyright https://github.com/hezedu/SomethingBoring/blob/master/algorithm/DebounceTime.js
// unmidify

function getFirstLine(stdout){
  stdout = stdout.trimLeft();
  const i = stdout.indexOf('\n');
  return stdout.substr(0, i);
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
// $$common$$
exports.FLAG = '*********** LINUX-REMOTE-USER-SERVER-START ***********';
// $$common$$
exports.ERROR_FLAG = '*********** LINUX-REMOTE-USER-SERVER-ERROR ***********';

exports.getFirstLine = getFirstLine;
exports.escapeInjection = escapeInjection;
exports.escapeCRLF = escapeCRLF;

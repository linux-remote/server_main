// on Sep 22, 2018 copyright https://github.com/hezedu/SomethingBoring/blob/master/algorithm/DebounceTime.js
// unmidify

function getFirstLine(stdout){
  stdout = stdout.trimLeft();
  const i = stdout.indexOf('\n');
  return stdout.substr(0, i);
}
exports.FLAG = '*********** LINUX-REMOTE-SERVER-START ***********';
exports.getFirstLine = getFirstLine;

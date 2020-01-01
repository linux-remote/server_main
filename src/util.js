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

// echo "$HOME" /home/dw
// echo '$HOME' $home
// echo `$HOME` bash: /home/dw: Is a directory
function safeWrap(disinfectedInput){
  return `'${disinfectedInput}'`
}

// function escapeCRLF(userInput) { password has ` " ' ???
//   return userInput.replace(/\n|\r|`/g, (mstr) => {
//     // `str` 会执行
//     switch(mstr) {
//       case '\n':
//         return '\\n';
//       case '\r':
//         return '\\r';
//       default:
//         return '\\' + mstr;
//     }
//   });
// }

module.exports = {
  getFirstLine,
  escapeInjection,
  safeWrap,
  // $$common$$
  FLAG: '*********** LINUX-REMOTE-USER-SERVER-START ***********',
  // $$common$$
  ERROR_FLAG: '*********** LINUX-REMOTE-USER-SERVER-ERROR ***********'
}



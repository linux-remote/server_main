

function disinfect(userInput) {
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

module.exports = {
  disinfect,
  safeWrap
};
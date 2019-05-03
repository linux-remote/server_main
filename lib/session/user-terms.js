const { _getSessKey } = require('../../common/util');
const userTerms = Object.create(null);

function setUserTerms(sid, username, term) {
  const key = _getSessKey(sid, username);
  if(userTerms[key]){
    delUserTermsByKey(key, term);
  }
  userTerms[key] = term;
}
function delUserTerms(sid, username) {
  const key = _getSessKey(sid, username);
  delUserTermsByKey(key);
}

function delUserTermsByKey(key) {
  const term = userTerms[key];
  term.kill();
  delete(userTerms[key]);
}

function clearBySid(sid) {
  Object.keys(userTerms).forEach(key => {
    if(key.indexOf(sid) !== -1){
      delUserTermsByKey(key);
    }
  });
}
function isHaveTerm(sid, username){
  const key = _getSessKey(sid, username);
  return userTerms[key] !== undefined;
}
module.exports = {
  add: setUserTerms,
  kill: delUserTerms,
  clearBySid,
  isHaveTerm
}

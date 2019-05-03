
const userMap = Object.create(null);
function _key(sid, username) {
  return sid + username;
}
function getUser(sid, username){
  const key = _key(sid, username);
  return userMap[key];
}

function setUser(sid, username, userObj) {
  const key = _key(sid, username);
  if(userMap[key]){
    delUserByKey(key, userObj);
  }
  userMap[key] = userObj;
}

function delUser(sid, username) {
  const key = _key(sid, username);
  delUserByKey(key);
}

function delUserByKey(key) {
  const user = userMap[key];
  user.logout();
  delete(userMap[key]);
}

function clearBySid(sid) {
  Object.keys(userMap).forEach(key => {
    if(key.indexOf(sid) !== -1){
      delUserByKey(key);
    }
  });
}

module.exports = {
  getUser,
  setUser,
  delUser,
  clearBySid
}

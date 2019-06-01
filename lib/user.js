function getUser(term){
  return {
    term,
    connections: 0,
    now: Date.now()
  }
}

function upUserConn(user, conn){
  user.connections = user.connections + 1;
  conn.on('close', function(){
    user.connections = user.connections - 1;
    user.now = Date.now();
  })
}

module.exports = {
  getUser,
  upUserConn
}
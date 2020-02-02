

const { initSessUser } = require('../lib/session');
// const ipcSay = require('../lib/ipc-say');

function verifyUser(req, res, next){
  const user = initSessUser(req, req.params.username);
  console.log('user', user, req.params.username);
  if(user){
    next();
    return;
  }
  next({status: 403});
}

// router.post('/upload', function(req, res){
//   res.end('ok');
// });

// ws...

module.exports = {
  verifyUser
};

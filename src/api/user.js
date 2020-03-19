

const { initSessUser } = require('../lib/session');

function handleUser(req, res, next){
  const user = initSessUser(req, req.params.username);
  if(user){
    if(req.method === 'GET'){
      if(req.url === '/alive'){
        res.end('Y');
      } else {
        next();
      }
    } else {
      next();
    }
    return;
  }
  next({status: 403});
}

// router.post('/upload', function(req, res){
//   res.end('ok');
// });

// ws...

module.exports = handleUser;

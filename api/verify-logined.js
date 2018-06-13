// get
module.exports = function(req, res, next){
  if(!req.session.loginedMap || Object.keys(req.session.loginedMap).length === 0){
    res.status(403).send('forbidden!');
  } else {
    next();
  }
}

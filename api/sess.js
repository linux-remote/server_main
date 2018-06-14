// get
exports.touch = function(req, res){
  res.apiOk({
    loginedMap : req.session.loginedMap || null
  });
}

// get
exports.verifyLogined = function(req, res, next){
  if(!req.session.loginedMap || Object.keys(req.session.loginedMap).length === 0){
    res.status(403).send('forbidden!');
  } else {
    next();
  }
}

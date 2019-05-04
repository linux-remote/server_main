// get
exports.touch = function(req, res){
  const loginedMap = req.session.loginedMap || Object.create(null);
  res.json({
    loginedList : Object.keys(loginedMap)
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

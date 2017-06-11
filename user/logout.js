// post
exports.logout = function(req, res, next){
  request.delete('http://unix:' +
  util.getTmpName(req.session.id, req.body.username) +
  '.sock:/exit', function(err){
    if(err) return next(err);

    var i = req.session.loginedList.indexOf(req.body.username);
    if(i !== -1){
      req.session.loginedList.splice(i, 1);
    }
    res.apiOk(req.session.loginedList);

  })

}

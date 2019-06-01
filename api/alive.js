
// get
module.exports = function(req, res){
  const user = req.session.userMap.get(req.params.username);
  user.now = Date.now();
  res.end('ok'); 
}

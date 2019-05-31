
// get
exports.touch = function(req, res){
  const userMap = req.session.userMap;
  if(!userMap){
    return res.json([]);
  }
  res.json({
    loginedList : Array.from(userMap.keys())
  });
}

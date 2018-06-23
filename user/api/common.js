const ls = require('./ls');

exports._reGetItem = function(req, res, next){
  ls(req._itemPath, {self: true}, (err, result) => {
    if(err){
      return next(err);
    }
    res.apiOk(result);
  })
}

const request = require('request');
request.post('http://unix:/dev/shm/linux-remote-callback.sock:/', function(err, result){
  console.log(result.body)
})
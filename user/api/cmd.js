const exec = require('child_process').exec;

module.exports = function(req, res, next){
  console.log('req.body', req.body, 'cwd2', req.PATH);
  exec(req.body.cmd, {env : process.env, cwd: req.PATH}, function(err, stdout, stderr) {
    console.error('execexecexec');
    if(err) {
      console.error('err', err);
      return next(err);
    }
    console.log('stderr', stderr);
    res.send({
      stdout,
      stderr
    });
  });
}
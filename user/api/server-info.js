const express = require('express');
const router = express.Router();

const os = require('os');
const {exec} = require('child_process');

router.get('/', function(req, res, next){
  exec('cat /etc/issue', (err, result) => {
    if(err) return next(err);
    res.apiOk({
      platform: os.platform(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      cpus: os.cpus(),
      arch: os.arch(),
      release: os.release(),
      issue: result.trim(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      tmpdir: os.tmpdir(),
      endianness: os.endianness(),
      networkInterfaces: os.networkInterfaces()
    })
  })

});

module.exports = router;

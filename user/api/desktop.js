var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

const {fsGetOrInit} = require('./util');

const firstDeskData = '[{"type":"app","id":"sys_recycle_bin","x": 0,"y":0}]';
const deskTopConfigPath = path.join(global.LR_PATH, '.desktop.json');

router.get('/', function(req, res, next){
  fsGetOrInit(deskTopConfigPath, firstDeskData, function(err, result){
    if(err){
      return next(err);
    }
    res.apiOk(result);
  });
});
router.post('/', function(req, res, next){
  fs.writeFile(deskTopConfigPath, req.body.data, function(err){
    if(err){
      return next(err);
    }
    res.apiOk();
  })
});


module.exports = router;

var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

const {fsGetOrInit} = require('./util');

const firstData = '[]';
const configPath = path.join(global.LR_PATH, '.quick-bar.json');

router.get('/', function(req, res, next){
  fsGetOrInit(configPath, firstData, function(err, result){
    if(err){
      return next(err);
    }
    res.apiOk(result);
  });
});
router.post('/', function(req, res, next){
  fs.writeFile(configPath, req.body.data, function(err){
    if(err){
      return next(err);
    }
    res.apiOk();
  })
});


module.exports = router;

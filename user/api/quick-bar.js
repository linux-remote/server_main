var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

const {fsGetOrInit} = require('./util');

const QUICK_BAR_CONFIG_PATH = path.join(global.LR_PATH, '.quick-bar.json');

router.get('/', function(req, res, next){
  fsGetOrInit(QUICK_BAR_CONFIG_PATH, '', function(err, result){
    if(err){
      return next(err);
    }
    res.apiOk(result);
  });
});
router.post('/', function(req, res, next){
  fs.writeFile(QUICK_BAR_CONFIG_PATH, req.body.data, function(err){
    if(err){
      return next(err);
    }
    res.apiOk();
  })
});


module.exports = router;

var express = require('express');
var router = express.Router();

const os = require('os');
const path = require('path');
const fs = require('fs');
const {exec} = require('child_process');
const sas = require('sas');

const {fsGetOrInit} = require('./util');

const ICON_CONF_PATH = path.join(global.LR_PATH, '.desktop.json');
const ICON_INIT_DATA = '';

router.get('/icons', function(req, res, next){
  fsGetOrInit(ICON_CONF_PATH, ICON_INIT_DATA, function(err, result){
    if(err){
      return next(err);
    }
    res.apiOk(result);
  });
});

router.post('/icons', function(req, res, next){
  fs.writeFile(ICON_CONF_PATH, req.body.data, function(err){
    if(err){
      return next(err);
    }
    res.apiOk();
  })
});

const QUICK_BAR_CONFIG_PATH = path.join(global.LR_PATH, '.quick-bar.json');
const QUICK_BAR_INIT_DATA = '';

router.get('/quickBar', function(req, res, next){
  fsGetOrInit(QUICK_BAR_CONFIG_PATH, QUICK_BAR_INIT_DATA, function(err, result){
    if(err){
      return next(err);
    }
    res.apiOk(result);
  });
});

router.post('/quickBar', function(req, res, next){
  fs.writeFile(QUICK_BAR_CONFIG_PATH, req.body.data, function(err){
    if(err){
      return next(err);
    }
    res.apiOk();
  })
});

router.get('/bundle', function(req, res, next){
  sas({
    $recycebinFiles: cb => fs.readdir(global.RECYCLE_BIN_PATH, cb),
    $groups : cb => exec('groups', cb),
    $icons: cb => fsGetOrInit(ICON_CONF_PATH, ICON_INIT_DATA, cb),
    $quickBar: cb => fsGetOrInit(QUICK_BAR_CONFIG_PATH, QUICK_BAR_INIT_DATA, cb)
  }, function(err, result){
    if(err){
      return next(err);
    }
    result.recycebinIsEmpty = result.recycebinFiles.length === 0;
    delete(result.recycebinFiles);
    result.groups = result.groups.substr(0, result.groups.length - 1).split(/\s/); //substr 去除最后的 \n 

    res.apiOk({
      ...result,
      hostname: os.hostname(),
      homedir: os.homedir(),
      mask: process.umask()
    })
  })
});

module.exports = router;

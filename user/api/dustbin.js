var express = require('express');
var router = express.Router();
// const os = require('os');
const {exec} = require('child_process');
//const fs = require('fs');
const sas = require('sas');
const path = require('path');
const ls = require('./ls');
// const express = require('express');
// const router = express.Router();
const ADDRESS = '/var/tmp/linux-remote/dustbin/' + global.APP.USER.username;
router.get('/', function(req, res, next){

  ls(ADDRESS, {noDir: true, other: '--reverse'}, (err, result) => {
    if(err){
      return next(err);
    }
    const result2 = [];

    result.forEach((v, i) => {
      // let key = v.name;
      // if(v.name.indexOf('.lnk') === -1){
      //   obj[key] = v;
      // }
      if(i % 2 === 1){
        let linkItem = result[i - 1].symbolicLink;
        let linkPath = linkItem.linkPath;
        let pathObj = path.parse(linkPath);
        let obj = {
          delTime: Number(v.name),
          name: pathObj.base,
          sourceDir: pathObj.dir,
          isCover: !linkItem.linkTargetError
        };
        Object.assign(v, obj);
        result2.push(v);
      }
    });
    res.apiOk(result2);
  })
})

router.post('/recycle', function(req, res, next){
  const item = req.body;
  const name = item.delTime;
  const sourceDir = item.sourceDir;
  sas({
    mv: cb => exec(`mv ${ADDRESS}/${name} ${sourceDir}/${item.name}`, cb),
    delLnk: cb => exec(`rm -rf ${ADDRESS}/${name}.lnk`, cb)
  }, (err) => {
    if(err) return next(err);
    res.apiOk();
  })
});

router.delete('/:name', function(req, res, next){
  const name = req.params.name;
  sas({
    del: cb => exec(`rm -rf ${ADDRESS}/${name}`, cb),
    delLnk: cb => exec(`rm -rf ${ADDRESS}/${name}.lnk`, cb)
  }, (err) => {
    if(err) return next(err);
    res.apiOk();
  })
});

router.delete('/', function(req, res, next){
  exec(`rm -rf ${ADDRESS}/*`, err => {
    if(err) return next(err);
    res.apiOk();
  });
  // fs.readdir(ADDRESS, (err, files){
  //   if(err) return next(err);
  //   files.map()
  // })
});

module.exports = router;

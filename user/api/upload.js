var express = require('express');
var router = express.Router();
var multer = require('multer');
var tmpDir = require('os').tmpdir();
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
const {wrapPath} = require('./util');
const prevTmpName = path.basename(process.env.PORT, '.sock');
const {_reGetItem} = require('./common');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    req._originalname = file.originalname;
    var tmpName = 'lr-upload-tmp' +  prevTmpName + Date.now();
    req.tmpPath = path.join(tmpDir, tmpName);
    cb(null, tmpName);
  }
})

var upload = multer({storage}).single('file');

router.put('*',  function(req, res, next){

  req.on('aborted', () => {
    fs.unlink(req.tmpPath);
  })
  
  upload(req, res, function(err){
    if(err){
      return next(err);
    }
    req.PATH = decodeURIComponent(req.path);
    req._itemPath = path.join(req.PATH, req._originalname);

    exec(`mv ${req.tmpPath} ${wrapPath(req._itemPath)}`, function(err){
      if(err){
        return next(err);
      }
      // console.log('_itemPath', req.tmpPath)
      _reGetItem(req, res, next);
    })
  })

});

module.exports = router;
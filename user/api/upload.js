var express = require('express');
var router = express.Router();
var multer = require('multer');
const {_reGetItem} = require('./common');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    req.PATH = decodeURIComponent(req.path);
    cb(null, req.PATH);
  },
  filename: function (req, file, cb) {
    req._originalname = file.originalname;

    cb(null, req._originalname);
  }
})
var upload = multer({storage}).single('file');

router.put('*',  function(req, res, next){
  upload(req, res, function(err){
    if(err){
      console.log('upload error', err);
      return next(err);
    }
    req._itemPath = req.PATH + '/' + req._originalname;
    _reGetItem(req, res, next);

  })

});

module.exports = router;
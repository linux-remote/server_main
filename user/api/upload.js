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

    cb(null, file.originalname);
  }
})
var upload = multer({storage});

router.put('*', upload.single('file'), function(req, res, next){
  //console.log('req.PATH', req.PATH)
  req._itemPath = req.PATH + '/' + req._originalname;
  next();
}, _reGetItem);

module.exports = router;
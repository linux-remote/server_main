var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, decodeURIComponent(req.path));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({storage});

router.put('*', upload.single('file'), function(req, res, next){
  res.apiOk('ok');
});

module.exports = router;
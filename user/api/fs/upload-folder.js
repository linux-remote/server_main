// var express = require('express');
// var router = express.Router();

var path = require('path');
var mkdirp = require('mkdirp');
var sas = require('sas');
var exec = require('child_process').exec;
var formidable = require('formidable')


module.exports = function(req, res, next) {
  const toPath = decodeURIComponent(req.path);
  const form = new formidable.IncomingForm();
  form.multiples = true;

  form.parse(req, function(err, fields, files) {
    var folderDirMap = {}, asyncTasks = {};

    files.file.forEach((v) => {
      const dirname = path.dirname(v.name);
      if(!folderDirMap[dirname]){
        mkdirp.sync(path.join(toPath, dirname))
      }
      asyncTasks[v.name] = v.path;
    })

    const sasIte = function(v){
      return function(cb, i){
        const  p = path.join(toPath, i.index);
        exec(`mv ${v} "${p}"`, cb)
      }
    };

    sas(asyncTasks, sasIte, (err) => {
      if(err){
        return next(err);
      }
      res.end('ok');
    })
  });
}

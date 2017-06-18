// const os = require('os');
// const {execSync} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
// const express = require('express');
// const router = express.Router();
module.exports = function(req, res, next){
  if(req.method === 'GET'){
    if(req.query.dir){
      return readdir(req, res, next);
    }
  }
  next();
}

function readdir(req, res, next){
  const result = [];
  function _read(callback){
    fs.readdir(req.path, function(err, files){
      if(err) return callback(err);
      const tasks = {};
      files.forEach((v, i) =>{
        tasks[i] = v
      });
      callback('$reload', tasks);
    })
  }

  function _lstat(name){
    return function(callback, i){
      fs.lstat(path.join(req.path, name), function(err, stat){
        if(err) return callback(err);
        result[i.index] = {
          name,
          isDirectory: stat.isDirectory(),
          isSymbolicLink: stat.isSymbolicLink()
        };
        callback();
      })
    }
  }
  sas(_read, _lstat, function(err){
    if(err) return next(err);
    res.apiOk(result);
  })

  // fs.readdir(req.path, function(err, result){
  //   if(err) return next(err);
  //   res.apiOk(result);
  // })


}

// const os = require('os');
const {exec} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
// const express = require('express');
// const router = express.Router();
module.exports = function(req, res, next){
  const method = req.method;
  if(method === 'GET'){
    if(req.query.dir){
      return readdir(req, res, next);
    }
  }else if(method === 'POST'){
    if(req.body.type === 'file'){
      return writeFile(req, res, next);
    }else{
      return mkDir(req, res, next);
    }
  }else if(method === 'DELETE'){
    return deleteAll(req, res, next);
  }
  next();
}

function deleteAll(req, res, next){
  const _path = path.join(req.path, req.query.name);
  exec('rm -rf ' + _path, function(err){
    if(err) return next(err);
    res.apiOk();
  })
}

function mkDir(req, res, next){
  const _path = path.join(req.path, req.body.name);
  fs.mkdir(_path, err => {
    if(err)  return next(err);
    res.apiOk();
  })
}

function writeFile(req, res, next){
  const _path = path.join(req.path, req.body.name);
  fs.writeFile(_path, '', err => {
    if(err) return next(err);
    res.apiOk();
  });
}

function readdir(req, res, next){
  const result = [], DIR = decodeURIComponent(req.path);
  function _read(callback){
    fs.readdir(DIR, function(err, files){
      if(err) return callback(err);
      if(!files.length) return callback();
      const tasks = {};
      files.forEach((v, i) =>{
        tasks[i] = v
      });
      callback('$reload', tasks);
    })
  }

  function _lstat(name){
    return function(callback, i){
      fs.lstat(path.join(DIR, name), function(err, stat){
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


}

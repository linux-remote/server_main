// const os = require('os');
const {exec} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
// const express = require('express');
// const router = express.Router();
module.exports = function(req, res, next){
  const method = req.method;
  req.DIR = decodeURIComponent(req.path);
  if(method === 'GET'){
    if(req.query.dir){
      return readdir(req, res, next);
    }else{
      return readFile(req, res, next);
    }
  }else if(method === 'POST'){
    if(req.body.type === 'file'){
      return writeFile(req, res, next);
    }else if(req.body.type === 'rename'){
      return rename(req, res, next);
    }else{
      return mkDir(req, res, next);
    }
  }else if(method === 'PUT'){

    return updateFile(req, res, next);
  }else if(method === 'DELETE'){
    return deleteAll(req, res, next);
  }
  next();
}

function rename(req, res, next){
  const {oldName, newName} = req.body;
  const oldPath = path.join(req.DIR, oldName);
  const newPath = path.join(req.DIR, newName);
  fs.rename(oldPath, newPath, function(err){
    if(err) return next(err);
    res.apiOk();
  })
}
function deleteAll(req, res, next){
  //const _path = path.join(req.DIR, req.query.name);
  // console.log('req.DIR', req.DIR, req.query, req.body);
  // return res.apiOk();
  exec('rm -rf ' + req.DIR, function(err){
    if(err) return next(err);
    res.apiOk();
  })
}

function mkDir(req, res, next){
  const _path = path.join(req.DIR, req.body.name);
  fs.mkdir(_path, err => {
    if(err)  return next(err);
    res.apiOk();
  })
}

function updateFile(req, res, next){
  //const _path = path.join(req.DIR, req.body.name);
  fs.writeFile(req.DIR, req.body.text, err => {
    if(err) return next(err);
    res.apiOk();
  });
}

function writeFile(req, res, next){
  const _path = path.join(req.DIR, req.body.name);
  fs.writeFile(_path, '', err => {
    if(err) return next(err);
    res.apiOk();
  });
}
function readFile(req, res, next){
  fs.readFile(req.DIR, 'utf-8', function(err, result){
    if(err) return next(err);
    res.apiOk(result);
  })
}

function getStatFnAttr(stat){
  stat.type = null;
  if(stat.isDirectory()){
    stat.type = 'directory';
    stat.isDirectory = true;
  }else if(stat.isFile()){
    stat.type = 'file';
    stat.isFile = true;
  // }else if(stat.isSymbolicLink){
  //   stat.type = 'symbolicLink';
  }else if(stat.isSocket()){
    stat.type = 'socket';
  }else if(stat.isFIFO()){
    stat.type = 'FIFO';
  }else if(stat.isBlockDevice()){
    stat.type = 'blockDevice';
  }else if(stat.isCharacterDevice()){
    stat.type = 'characterDevice'
  }else{
    stat.type = 'unknown';
  }
}

function readdir(req, res, next){
  const result = [], DIR = req.DIR;
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
      const _path = path.join(DIR, name);

      result[i.index] = {
        name: name,
        error: null
      };

      fs.lstat(_path, function(error, stat){

        if(error){
          error.place = 'readlink';
          result[i.index].error = error;
          return callback();
        }

        result[i.index] = Object.assign(stat, result[i.index]);
        //console.log('stat S_IFMT2', fs.constants.S_IFMT)
        const isSymbolicLink = stat.isSymbolicLink();
        stat.isSymbolicLink = isSymbolicLink;
        getStatFnAttr(stat);
        // result[i.index] = {
        //   name,
        //   size: stat.size,
        //   //mode: stat.mode,
        //   blocks: stat.blocks,
        //   blksize: stat.blksize,
        //   nlink: stat.nlink,
        //   isFile: stat.isFile(),
        //   // isBlockDevice: stat.isBlockDevice(),
        //   // isCharacterDevice: stat.isCharacterDevice(),
        //   // isFIFO: stat.isFIFO(),
        //   // isSocket: stat.isSocket(),
        //   isSymbolicLink: isSymbolicLink
        // };

        if(!isSymbolicLink){
          callback();
        }else{
          fs.readlink(_path, function(err, linkString){
            if(err){
              err.place = 'readlink';
              stat.error = err;
              return callback();
            }
            fs.stat(_path, function(err, stat2){
              if(err) {
                stat.error = err;
                err.place = 'stat link path';
                return callback();
              }

              //result[i.index] = stat2;

              //stat2.name = name;
              getStatFnAttr(stat2);
              console.log('start2', stat2.type);
              stat.type = stat2.type;
              stat.linkPath = path.resolve(DIR, linkString);
              //stat.symbolicLink = stat2;
              callback();
            })
          })
        }

      })

    }
  }
  sas(_read, _lstat, function(err){
    if(err) return next(err);
    res.apiOk(result);
  })


}

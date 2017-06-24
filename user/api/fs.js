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
  stat.isDirectory = stat.isDirectory();
  if(!stat.isDirectory){
    stat.isFile = stat.isFile();
    if(!stat.isFile){
      if(stat.isSocket()){
        stat._type = 'socket';
      }else if(stat.isFIFO()){
        stat._type = 'FIFO';
      }else if(stat.isBlockDevice()){
        stat._type = 'blockDevice';
      }else if(stat.isCharacterDevice()){
        stat._type = 'characterDevice'
      }else{
        stat._type = 'unknown';
      }
    }
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

      // exec('ls -l ' + _path, function(err, data){
      //   if(err){
      //     console.log('err',err)
      //   }else{
      //     console.log('data', data);
      //   }
      // })

      fs.lstat(_path, function(err, stat){
        if(err) return callback(err);

        result[i.index] = stat;

        const isSymbolicLink = stat.isSymbolicLink();


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
          stat.name = name;
          stat.isSymbolicLink = isSymbolicLink;
          getStatFnAttr(stat);
          callback();
        }else{

          fs.readlink(_path, function(err, linkString){
            if(err) return callback(err);
            fs.stat(_path, function(err, stat2){
              if(err) {
                return callback(err);
              }

              result[i.index] = stat2;

              stat2.name = name;
              stat2.linkString = linkString;
              stat2.isSymbolicLink = isSymbolicLink;
              getStatFnAttr(stat2);
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

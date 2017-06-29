// const os = require('os');
const {exec} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
// const express = require('express');
// const router = express.Router();
const ls = require('./ls');

module.exports = function(req, res, next){
  const method = req.method;
  req.PATH = decodeURIComponent(req.path);

  if(method === 'GET'){
    if(req.query.dir){
      return readDir(req, res, next);
    }else{
      return readFile(req, res, next);
    }
  }

  if(method === 'DELETE'){
    return moveToDustbin(req, res, next);
  }

  //fs.lstat(req.PATH, (err, stat) => {

    // if(err) return next(err);
    // req.STAT = stat;
  if(method === 'PUT'){
    return updateFile(req, res, next);
  }

  if(method === 'POST'){
    const ctrl = bodyMap[req.body.type];
    if(ctrl){
      return ctrl(req, res, next);
    }

  }

  next();
}

const bodyMap = {
  createSymbolicLink,
  rename,
  createFile,
  createFolder
}

function createSymbolicLink(req, res, next){
  const {name} = req.body;
  let _newPath = path.dirname(req.PATH);
  _newPath = path.join(_newPath, name);
  exec('ln -s ' + req.PATH + ' ' + _newPath, (err) => {
    if(err) return next(err);
    res.apiOk();
  })
}

function rename(req, res, next){
  const {oldName, newName} = req.body;
  const oldPath = path.join(req.PATH, oldName);
  const newPath = path.join(req.PATH, newName);
  fs.rename(oldPath, newPath, function(err){
    if(err) return next(err);
    res.apiOk();
  })
}

// const COM_CONST = require('')
// console.log('DUSTBIN_PATH2', DUSTBIN_PATH);
let iDustPathChahe = false;
function initDustBin(cb){
  if(iDustPathChahe) return cb();
  const iDustPath = path.join(global.APP.DUSTBIN_PATH, global.APP.USER.username)
  fs.stat(iDustPath, function(err){
    if(err){
      if(err.code !== 'ENOENT'){
        return cb(err);
      }
      const mkdir = cb => exec('mkdir -m=700 ' + iDustPath, cb);
      const $iDustPath = cb => {
        iDustPathChahe = iDustPath;
        cb()
      }
      sas([mkdir,  $iDustPath], cb);
    }else{
      iDustPathChahe = iDustPath;
      cb();
    }
  })
}

function moveToDustbin(req, res, next){
  const _path = req.PATH;

  // console.log('req.PATH', req.PATH, req.query, req.body);
  // return res.apiOk();
  initDustBin( function(err){
    if(err) {
      err.place = 'init dustbin';
      return next(err);
    }
    console.log('path.dirname(_path)', path.dirname(_path))
    console.log('global.APP.DUSTBIN_PATH', iDustPathChahe)
    if(path.dirname(_path) === iDustPathChahe){
      console.log('delete in dustbin')
      return deleteAll(req, res, next);
    }
    // let dustName = [
    //   _path.replace('/', PATH_SPLIT),
    //
    //   Date.now(),
    // ]
    const INDEX = Date.now().toString();
    const dustPath = path.join(iDustPathChahe, INDEX);
    const link = cb => exec(`ln -s ${_path} ${dustPath}.lnk`, cb);
    const move = cb => exec(`mv ${_path} ${dustPath}`, cb);
    sas({
      link,
      move
    }, function(err){
      if(err) return next(err);
      res.apiOk();
    })
  })
}

function deleteAll(req, res, next){
  //const _path = path.join(req.PATH, req.query.name);
  // console.log('req.PATH', req.PATH, req.query, req.body);
  // return res.apiOk();
  exec('rm -rf ' + req.PATH, function(err){
    if(err) return next(err);
    res.apiOk();
  })
}

function createFolder(req, res, next){
  const _path = path.join(req.PATH, req.body.name);
  fs.mkdir(_path, err => {
    if(err)  return next(err);
    res.apiOk();
  })
}

function updateFile(req, res, next){
  //const _path = path.join(req.PATH, req.body.name);
  fs.writeFile(req.PATH, req.body.text, err => {
    if(err) return next(err);
    res.apiOk();
  });
}

function createFile(req, res, next){
  const _path = path.join(req.PATH, req.body.name);
  fs.writeFile(_path, '', err => {
    if(err) return next(err);
    res.apiOk();
  });
}
function readFile(req, res, next){
  fs.readFile(req.PATH, 'utf-8', function(err, result){
    if(err) return next(err);
    res.apiOk(result);
  })
}

function readDir(req, res, next){
  ls(req.PATH, (err, result) => {
    if(err) return next(err);
    res.apiOk(result);
  })
}

// const os = require('os');
const {exec} = require('child_process');
const fs = require('fs');
const sas = require('sas');
const path = require('path');
const {wrapPath} = require('./util');
const ls = require('./ls');

const bodyMap = {
  createSymbolicLink,
  rename,
  createFile,
  createFolder
}

function fsSys(req, res, next){
  const method = req.method;
  req.PATH = decodeURIComponent(req.path);

  if(method === 'GET'){
    if(req.query.dir){
      return readDir(req, res, next);
    }else{

      if(req.query.download){
        return res.download(req.PATH);
      }
      return readFile(req, res, next);
    }
  }

  if(method === 'DELETE'){
    return moveToDustbin(req, res, next);
  }

  if(method === 'PUT'){
    return updateFile(req, res, next);
  }

  if(method === 'POST'){
    const ctrl = bodyMap[req.body.type || req.query.type];
    if(ctrl){
      return ctrl(req, res, next);
    }

  }

  next();
}

function createSymbolicLink(req, res, next){
  const {name} = req.body;
  let _newPath = path.dirname(req.PATH);
  _newPath = path.join(_newPath, name);
  exec('ln -s ' + wrapPath(req.PATH) + ' ' + wrapPath(_newPath), (err) => {
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


function moveToDustbin(req, res, next){
  const _path = req.PATH;

  if(path.dirname(_path) === global.RECYCLE_BIN_PATH){
    return deleteAll(req, res, next);
  }
  const INDEX = Date.now().toString();
  const dustPath = path.join(global.RECYCLE_BIN_PATH, INDEX);
  const wrapedPath = wrapPath(_path);
  const link = cb => exec(`ln -s ${wrapedPath} ${dustPath}.lnk`, cb);
  const move = cb => exec(`mv ${wrapedPath} ${dustPath}`, cb);
  sas({
    link,
    move
  }, function(err){
    if(err) return next(err);
    res.apiOk();
  })
}

function deleteAll(req, res, next){
  exec('rm -rf ' + wrapPath(req.PATH), function(err){
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

module.exports = fsSys;

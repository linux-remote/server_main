const express = require('express');
const router = express.Router();
const appList = [];
// var eStatic = express.static;
// const dependencies = require('../../package.json').dependencies;
// const path = require('path');
// 
// const PREFIX = 'lr-app';

// const MAX_AGE = global.IS_PRO ? 1000 * 60 * 60 * 24 * 30 * 6 : 0;

// Object.keys(dependencies).forEach(k => {
//   if(k.indexOf(PREFIX) === 0){
//     const _path = require.resolve(k);
//     var dir = path.dirname(_path);
//     const data = Object.create(null);
//     const pkg = require(dir + '/package.json');
//     const staticPath = '/static/' + pkg.name + '/' + pkg.version;

//     data.id = pkg.name;
//     data.title = pkg.lrName;
//     data.icon = pkg.lrIcon;
//     data.main = pkg.main;
//     data.staticPath = staticPath;
//     router.use(staticPath, eStatic(dir, {maxAge:MAX_AGE}));
//     appList.push(data);
//   }
// })

router.get('/list', function(req, res){
  res.apiOk([]);
})

exports.list = appList;

exports.router = router;

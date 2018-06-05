const {exec} = require('child_process');
const path = require('path');
const sas = require('sas');


function ls(_path, opts, callback){
  let isDirectory = false, d = '', a = '-a';

  if(typeof opts === 'function'){
    callback = opts;
    opts = {};
  }

  if(opts.self){
    d = '-d'
    isDirectory = true;
  }

  if(opts.noDir){
    a = '-A'
  }
  const other = opts.other || '';
  //console.log('a', opts, a);
  // const cmd = `ls -l --color=none ${a}  -h ${d} ${sort}  -Q --time-style=long-iso ${_path}`
  exec(`ls -l --color=none -Q --time-style=long-iso -h ${a} ${d} ${other} ${_path}`,
      //{env: {LS_COLORS: 'no=:or=OR'}, encoding: 'utf8'},
    function(err, result){
      if(err && !result) return callback(err);
      if(!isDirectory){
        result = result.substr(result.indexOf('\n') + 1); //remove total.
      }
      result = result.split('\n');
      result.pop();

      const lsSymbolicLinkTasks = {};
      result = result.map((v, i) => {
        //const rawV = v;
        v = v.split('"');
        const name = isDirectory ? undefined : v[1];

        const _pre = v[0].split(/ +/g);

        const data = {
          name,
          permission: _pre[0],
          owner: _pre[2],
          group: _pre[3],
          size: _pre[4]
        }

        let linkString = v[3];

        if(!isDirectory && linkString){
          //_pre.pop();
          //const isOrphan = lastFlag.indexOf('OR') !== -1;
          linkString = linkString[0] === '/' ? linkString : './' + linkString;
          const linkPath = path.resolve(_path, linkString);
          data.symbolicLink = {
            linkPath,
            linkTargetError: null
          }
          lsSymbolicLinkTasks[i] = data.symbolicLink;

          // if(!isOrphan){
          //   lsSymbolicLinkTasks[i] = data.symbolicLink;
          // }else{
          //   data.symbolicLink.linkTargetError = 'missing';
          // }
        }
        return data;
      });

      let taskKeys = Object.keys(lsSymbolicLinkTasks);
      if(taskKeys.length > 0){
        taskKeys.forEach(i => {
          let v = lsSymbolicLinkTasks[i];
          lsSymbolicLinkTasks[i] = function(cb){
            ls(v.linkPath, {self: true}, (err, result) => {
              if(err){
                let msg = err.message;
                const index = msg.lastIndexOf(':');
                msg = msg.substr(index + 1);
                //No such file or directory
                v.linkTargetError = msg.trim();
              }else{
                Object.assign(v, result);
              }
              cb();
            })
          }
        });
        sas(lsSymbolicLinkTasks, function(){
          callback(null, result);
        });
      }else{
        callback(null, isDirectory ? result[0] : result);
      }
    })
}

module.exports = ls;

// const os = require('os');
// const express = require('express');
// const router = express.Router();
//http://www.bigsoft.co.uk/blog/index.php/2008/04/11/configuring-ls_colors
// const typeMap2 = {
//   fi: 'File',
//   di: 'Dir',
//   ln: 'SymbolicLink',
//   pi: 'FIFO',  //FIFO, PIPE Named pipe
//   do: 'Door',
//   bd: 'BlockDevice',
//   cd: 'CharacterDevice',
//   or: 'Orphan', //Symbolic link pointing to a non-existent file
//   so: 'Socket',
//   mi: 'Missing',
//
//   su: 'SetUid',
//   sg: 'SetGid',
//   st: 'Sticky',
//
//   tw: 'STICKY_OTHER_WRITABLE',
//   ow: 'OTHER_WRITABLE',
//   ex: 'EXEC',
// }
//
// const perMap = {
//   su: 'SetUid',
//   sg: 'SetGid',
//   st: 'Sticky',
//
//   tw: 'STICKY_OTHER_WRITABLE',
//   ow: 'OTHER_WRITABLE',
//   ex: 'EXEC',
// }

// const typeMap = {
//   'd'
// }
// let colors = ['no='];
//
// for(let i in typeMap){
//   colors.push(i + '=' + i);
// }
// colors = colors.join(':');

const cookie = require('cookie');
const crypto = require('crypto');
const uidSafe = require('uid-safe');
const fs = require('fs');

const SID_LENGTH = 40; // crypto.randomBytes(30).length

function _genSidHashMap(){
  let filenames = fs.readdirSync(global.SESSION_PATH);
  const map = new Map();
  filenames.forEach(name => {
    if(name[0] === '.'){
      return;
    }
    name = name.split('.');
    const hash = name[0];
    const username = name[1];
    if(!map[hash]){
      map[hash] = new Map();
    }
    map[hash].set(username, true);
  });
  return map;
}

const sidHashMap = _genSidHashMap();

const sidMap = new Map();

function hashSid(sid){
  return crypto.createHash('sha256').update(sid).digest('hex')
}
function genSid(){
  // node uuid/v4 equal crypto.randomBytes(16).toString('hex');
  // https://github.com/kelektiv/node-uuid/blob/master/lib/rng.js
  // npm use UUID as token.

  // And we used crypto.randomBytes(30) (uid-safe used randomBytes too)

  // Express/session will use secret to generate the signature of sid, and then add it after sid.
  // Then the question becomes: If sid is UUID, does sid need signature?

  const sid = uidSafe.sync(30);
  const hash = hashSid(sid);
  if(sidHashMap.has(hash)){
    return genSid();
  }
  return {
    sid,
    hash
  };
}

exports.verify = function(req, res, next){
  const  headerCookie = req.headers.cookie;
  let isVerify = false;
  if(headerCookie){
    const cookies = cookie.parse(headerCookie);
    const sid = cookies.sid;
    if(sid && sid.length === SID_LENGTH){
      if(!sidMap.has(sid)){
        const sidHash = hashSid(sid);
        if(sidHashMap.has(sidHash)){
          sidMap.set(sid, sidHashMap.get(sidHash));
        }
      }
      const userMap = sidMap.get(sid);
      if(userMap && userMap.size){
        isVerify = true;
      }
    }
  }
  req.__isSessionVerify = isVerify;
  next();
}

exports.create = function(req, res){
  const opts = req.__cookieOptions;
  // if(sidMap.has(sid)){
  //   return next({
  //     status: 400,
  //     message: 'Already create session.' 
  //   })
  // }
  const {sid, hash} = genSid();
  sidMap.set(sid, true);
  sidHashMap.set(hash, true);

  res.cookie('sid', sid, {
    httpOnly: true,
    path: opts.path,
    secure: global.CONF.cookieSecure
  });
  res.type('text').end('ok');
}
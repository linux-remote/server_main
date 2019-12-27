
const crypto = require('crypto');

const fs = require('fs');
const {execSync} = require('child_process');
const os = require('os');
const path = require('path');
const uidSafe = require('uid-safe');

const SID_LENGTH = 40; // crypto.randomBytes(30).length

function initTmpPath(){
  let tmpPath;
  try{
    tmpPath = '/dev/shm/linux-remote';
    execSync('mkdir -m=1777 -p -- ' + tmpPath);
  }catch(e) {
    tmpPath = path.join(os.tmpdir(), 'linux-remote');
    execSync('mkdir -m=1777 -p -- ' + tmpPath);
  }
  return tmpPath;
}

function initSidHashMap(tmpPath){
  let filenames = fs.readdirSync(tmpPath);
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

const TMP_PATH = initTmpPath();
const sidHashMap = initSidHashMap(TMP_PATH);

const sidMap = new Map();

function getTmpName(sid, username){
  return `${TMP_PATH}/${sid}.${username}`
}

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


function setSid({sid, hash}, username){
  const userMap = new Map([[username, true]]);
  sidMap.set(sid, userMap);
  sidHashMap.set(hash, userMap);
}

function getUserMapBySid(sid){
  // Cookie value is always string.
  if(sid && sid.length === SID_LENGTH){
    if(!sidMap.has(sid)){
      const sidHash = hashSid(sid);
      if(sidHashMap.has(sidHash)){
        sidMap.set(sid, sidHashMap.get(sidHash));
      }
    }
    return sidMap.get(sid);
  }
}

function setCookie(res, sid, cookieSecure){
  res.cookie('sid', sid, {
    httpOnly: true,
    path: '/api',
    secure: cookieSecure
  });
}



module.exports = {
  genSid,
  setSid,
  getUserMapBySid,
  setCookie,
  getTmpName
}
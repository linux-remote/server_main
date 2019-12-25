
const cookie = require('cookie');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const uidSafe = require('uid-safe');
const sidHashMap = new Map();
const sidMap = new Map();
const SID_LENGTH = 64;
function hashSid(sid){
  return crypto.createHash('sha256').update(sid).digest('hex')
}
function genSid(){
  const sid = uuidv4().replace(/-/g, '') + uidSafe.sync(24);
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
          sidMap.set(sid, sidHash);
          sidHashMap.delete(sidHash);
        }
      }
      if(sidMap.has(sid)){
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
  var data = cookie.serialize('sid', sid, {
    httpOnly: true,
    path: opts.path,
    secure: '?'
  });
  res.setHeader('Set-Cookie', [data]);
  res.type('text').end('ok');
}
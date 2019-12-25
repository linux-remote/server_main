
const cookie = require('cookie');
const crypto = require('crypto');
const uuidv4 = require('uuid/v4');

const sidHashMap = new Map();
const sidMap = new Map();
const SID_LENGTH = 32;

exports.verify = function(req, res, next){
  const  headerCookie = req.headers.cookie;
  if(headerCookie){
    const cookies = cookie.parse(headerCookie);
    const sid = cookies.sid;
    if(sid && sid.length === SID_LENGTH){
      if(!sidMap.has(sid)){
        const sidHash = crypto.createHash('sha256').update(sid).digest('hex');
        if(sidHashMap.has(sidHash)){
          sidMap.set(sid, true);
          sidHashMap.delete(sidHash);
        }
      }
      if(sidMap.has(sid)){
        return next();
      }
    }
  }
  next({
    status: 403
  })
}

exports.create = function(req, res){
  const opts = req._cookieOptions;
  // if(sidMap.has(sid)){
  //   return next({
  //     status: 400,
  //     message: 'Already create session.'
  //   })
  // }
  const sid = uuidv4().replace(/-/g, '');
  sidMap.set(sid, true);
  var data = cookie.serialize('sid', sid, {
    httpOnly: true,
    path: opts.path,
    secure: '?'
  });
  res.setHeader('Set-Cookie', [data]);
  res.type('text').end('ok');
}
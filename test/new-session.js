const uidSafe = require('uid-safe');
let uid = uidSafe.sync(30);
console.log(uid, uid.length)
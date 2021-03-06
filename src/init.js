"use strict";

const os = require('os');


const fs = require('fs');
const path = require('path');
const { initSecure } = require('./lib/secure');
const { initSidMap, removeUser } = require('./lib/session');
let isPro = process.env.NODE_ENV === 'production';

let homeDir = os.userInfo().homedir;
let tmpDir,
  clientVersion,
  confPath,
  conf;

if(isPro){
  tmpDir = os.tmpdir();
  clientVersion = _getClientVersion();
  confPath = path.join(homeDir, 'config.js');
}else {
  tmpDir = '/dev/shm'; // Protect my disk
  clientVersion = 'dev';
  confPath = path.join(__dirname, '../../server/config-dev.js');
}

if(!clientVersion){
  console.error('Not has clientVersion.');
  process.exit(1);
}
conf = global.CONF = require(confPath);
// linux-remote Prevent cookies across ports
global.__API_PATH__ = '/_LRPCA_' + conf.port;
global.__HOME_DIR__ = homeDir;
global.IS_PRO = isPro;
global.__TMP_DIR__ = tmpDir;
global.__CLIENT_VERSION__ = clientVersion;


if(conf.appTrustProxy === true){
  console.error("can't set appTrustProxy true.");
  process.exit(1);
}

if(conf.secure){
  let errMsg = initSecure(conf.secure);
  
  if(errMsg){
    console.error('initSecure errMsg', errMsg);
    process.exit(1);
  }
}

conf.CORS = typeof conf.client === 'string' ? conf.client : null;

_def(conf, 'appTrustProxy', false);
_def(conf, 'cookie', Object.create(null));

function _getClientVersion(){
  let versionMap = fs.readFileSync(path.join(homeDir , '/.version-map.json'), 'utf-8');
  versionMap = JSON.parse(versionMap);
  let clientVersion = versionMap['_client'] || versionMap['client'];
  versionMap = null;
  return clientVersion;
}

function _def(obj, key, value){
  if(obj[key] === undefined){
    obj[key] = value;
  }
}

global.__handleProcessUnCbMsg__ = function(msgObj){
  if(msgObj.event === 'removeUser'){
    const data = msgObj.data;
    removeUser(data.sid, data.username);
  }
}

initSidMap(function(){
  require('./unix-socket-server.js');
  require('./server.js');
});

isPro = null;
tmpDir = null;
clientVersion = null;
homeDir = null;
confPath = null;
conf = null;
const wsNsPipe = require('./ws-ns-pipe.js');
const ipcSay = require('./ipc-say.js');
const pako = require('pako');
const SocketRequest = require('@hezedu/socket-request');

const maxLength = SocketRequest.compressTriggerPoint; // https://www.imperva.com/blog/mtu-mss-explained/

const wsOpenKey = 3;
const wsOnCloseKey = 4;
function noop(){}
const ws2nsOption = {
  beforeNsWrite(data){
    return typeof data !== 'string' ? pako.inflate(data) : data;
  },
  beforeWsSend(data){
    return data.length > maxLength ? pako.deflate(data) : data;
  },
  onOpen(ws, ns){
    ws.send(SocketRequest.wrapUnreplyMsg(['nsOpen']));
    ns.write(SocketRequest.wrapUnreplyMsg([wsOpenKey]));
  },
  onWsClose(ns, code, reason){
    const innerUnReplyMsg = SocketRequest.wrapUnreplyMsg([wsOnCloseKey, code, reason]);
    ns.write(innerUnReplyMsg);
  },
  onNsClose(ws, err){
    const msg = ['nsClose'];
    if(err){
      msg.push(err.name);
      msg.push(err.message);
    }
    const innerUnReplyMsg = SocketRequest.wrapUnreplyMsg(msg);
    ws.send(innerUnReplyMsg);
  }
}

function User(userData){
  this.data = userData;
  this.ws = null;
  this.ns = null;
  this.wsNsUnPipe = noop;
  this.unloadTimer = undefined;
  this.wsWaitTimer = undefined;
}

User.prototype.isWsReady = function(){
  if(this.ws && this.ws.readyState === 1){
    return true;
  }
  return false;
}

User.prototype.isNsReady = function(){
  if(this.ns && !this.ns.destroyed){
    return true;
  }
  return false;
}

User.prototype.sendWsNoReplyMsg = function(msg){
  if(this.isWsReady()){
    this.ws.send(SocketRequest.wrapUnreplyMsg(msg))
  }
}

User.prototype.writeNsNoReplyData = function(msg){
  if(this.isNsReady()){
    this.ns.write(SocketRequest.wrapUnreplyMsg(msg))
  }
}

User.prototype.newNsPipeWs = function(newNs){
  this.ns = newNs;
  if(this.isWsReady()){
    this._wsNsPipe();
    return true;
  }
  return false;
}

User.prototype.newWsPipeNs = function(newWs){
  this.ws = newWs;
  if(this.isNsReady()){
    this._wsNsPipe();
    return true;
  }
  return false;
}

User.prototype._wsNsPipe = function(){
  const unPipe = wsNsPipe(this.ws, this.ns, ws2nsOption);
  this.wsNsUnPipe = unPipe;
}

User.prototype.ensureClearUnloadTimeout = function(){
  if(this.unloadTimer){
    clearTimeout(this.unloadTimer);
    this.unloadTimer = null;
  }
}

User.prototype.handlePageUnload = function(sid, username){
  this.unloadTimer = setTimeout(() => {
    this.unloadTimer = null;
    if(this.ws.readyState > 1){
      console.log('exit by page unload.');
      this.exit(sid, username, true);
    }
  }, 5000);
}

User.prototype.exit = function(sid, username, isUnNormal, callback){
  this.wsNsUnPipe();
  ipcSay({type: 'logout', data: {sid, username, isUnNormal}}, () => {
    this.ws.close(1000);
    if(callback){
      callback();
    }
  });
}
User.prototype.clear = function(){
  this.wsNsUnPipe();
  this.ensureClearUnloadTimeout();
  if(this.wsWaitTimer){
    clearTimeout(this.wsWaitTimer);
    this.wsWaitTimer = undefined;
  }
}

module.exports = User;

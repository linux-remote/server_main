const wsNsPipe = require('./ws-ns-pipe.js');
const pako = require('pako');
const SocketRequest = require('@hezedu/socket-request');

const maxLength = SocketRequest.compressTriggerPoint; // https://www.imperva.com/blog/mtu-mss-explained/

const wsOpenKey = 3;
const wsOnCloseKey = 4;

const ws2nsOption = {
  beforeNsWrite(data){
    return typeof data !== 'string' ? pako.inflate(data) : data;
  },
  beforeWsSend(data){
    return data.length > maxLength ? pako.deflate(data) : data;
  },
  onBefore(ws, ns){
    ws.send(SocketRequest.wrapUnreplyMsg(['nsOpen']));
    ns.write(SocketRequest.wrapUnreplyMsg([wsOpenKey]));
  },
  onWsClose(ns, code, reason){
    const innerUnReplyMsg = SocketRequest.wrapUnreplyMsg([wsOnCloseKey, code, reason]);
    ns.write(innerUnReplyMsg);
  },
  onNsClose(ws, hadTransmissionError, err){
    const msg = ['nsClose', Number(hadTransmissionError)];
    if(err){
      msg.push(err.name + ': ' + err.message);
    }
    const innerUnReplyMsg = SocketRequest.wrapUnreplyMsg(msg);
    ws.send(innerUnReplyMsg);
  }
}

function userWsNsPipe(user){
  wsNsPipe(user.ws, user.ns, ws2nsOption);
}

module.exports = userWsNsPipe;

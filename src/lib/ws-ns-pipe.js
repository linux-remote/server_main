
/* 
  Web Socket 2 Net Socket.
  WebSocket
  https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  netSocket
  https://nodejs.org/api/net.html#net_class_net_socket
*/
// new Pipe 202/06/17

// server.handleUpgrade(request, socket, head, callback)
// server.shouldHandle(request) X 无用

function defHandle(data){
  return data;
}

function wsNsPipe(ws, ns, options){
  options = options || Object.create(null);
  const beforeNsWrite = options.beforeNsWrite || defHandle;
  const beforeWsSend = options.beforeWsSend || defHandle;
  
  if(options.onOpen){
    options.onOpen(ws, ns);
  }
  
  let wsError, nsError;

  const wsHandles = {
    message: function(e) {
      // e.data: {String|Buffer|ArrayBuffer|Buffer[]}

      ns.write(beforeNsWrite(e.data));
    },

    close: function(code, reason){

      _unBindNs(nsHandles, ns);

      if(options.onWsClose){
        options.onWsClose(ns, code, reason, wsError);
      }
      if(wsError){
        wsError = null;
      }
    },

    error: function(err){
      // https://github.com/websockets/ws/blob/master/doc/ws.md#event-error
      wsError = err;
    },
    // ping: function(){
    // send from server away.
    //   // client not send
    // },
    // pong: function(){
    // }
  }
  
  const nsHandles = {
    data: function(data){

      // Blob Always save to disk?
      // https://books.google.com/books?id=hYGOBQAAQBAJ&lpg=PT413&ots=4_yRc_ZxPC&dq=browser%20websocket%20small%20blob%20save%20disk%3F&pg=PT413#v=onepage&q=browser%20websocket%20small%20blob%20save%20disk?&f=false
      // //_console.log('ns on data', data);
      // let sendData = data;
      // if(data.length > maxLength){

      // }
      // var binary = pako.deflate(data);
      // //_console.log(binary.length, data.length);
      // console.log('ns on data', data);
      // data.length > maxLength ? pako.deflate(data) : data
      ws.send(beforeWsSend(data));
    },
    close: function(hadTransmissionError){ // boolean

      _unBindWs(wsHandles, ws);

      if(options.onNsClose){
        options.onNsClose(ws, hadTransmissionError, nsError);
      }
      if(nsError){
        nsError = null;
      }
    },
    error: function(err){
      nsError = err;
      // https://nodejs.org/api/net.html#net_event_error_1
      // The 'close' event will be called directly following this event.
    }
  }

  ns.setEncoding('utf-8');

  _bindWs(wsHandles, ws);
  _bindNs(nsHandles, ns);


  return function unpipe(){
    _unBindWs(wsHandles, ws);
    _unBindNs(nsHandles, ns);
  }
  // ws.onopen = function(){ // Don't trigger
  //   console.log('ws.onopen');
  //   if(options.onWsOpen){
  //     options.onWsOpen(ns);
  //   }
  //   //_console.log('ws on open')
  // }
}

function _bindNs(nsHandles, ns){
  Object.keys(nsHandles).forEach(key => {
    ns.on(key, nsHandles[key]);
  });
}

function _unBindNs(nsHandles, ns){
  Object.keys(nsHandles).forEach(key => {
    ns.off(key, nsHandles[key]);
  });
}

function _bindWs(wsHandles, ws){
  Object.keys(wsHandles).forEach(key => {
    ws.addEventListener(key, wsHandles[key]);
  })
}
function _unBindWs(wsHandles, ws){
  Object.keys(wsHandles).forEach(key => {
    ws.removeEventListener(key, wsHandles[key]);
  });
}

module.exports = wsNsPipe;

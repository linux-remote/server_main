
/* 
  Web Socket 2 Net Socket.
  WebSocket
  https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  netSocket
  https://nodejs.org/api/net.html#net_class_net_socket
*/


// server.handleUpgrade(request, socket, head, callback)
// server.shouldHandle(request) X 无用

// http server on upgrade -> verify session -> onnectedNs 
// -> ws server handleUpgrade -> emit connection -> 
// get ws and connectedNs
function defHandle(data){
  return data;
}

function ws2ns(ws, connectedNs, options){
  options = options || Object.create(null);
  const beforeNsWrite = options.beforeNsWrite || defHandle;
  const beforeWsSend = options.beforeWsSend || defHandle;
  let wsError,  nsError;

  if(options.onWsOpen){
    options.onWsOpen(connectedNs);
  }
  
  const wsHandles = {
    
    message: function(e) {
      // e.data: {String|Buffer|ArrayBuffer|Buffer[]}
      
      // let data = e.data;
      // if(typeof data !== 'string'){
      //   data = pako.inflate(data);
      // }
      // typeof e.data !== 'string' ? pako.inflate(e.data) : e.data
      
      connectedNs.write(beforeNsWrite(e.data));
    },

    close: function(closeEvent){

      Object.keys(nsHandles).forEach(key => {
        connectedNs.off(key, nsHandles[key]);
      });
      // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
      const code = closeEvent.code;
      let isNormal = (code === 1000);
      // if(code === 1000){
      //   // 正常退出
      //   connectedNs.destroy();
      //   // connectedNs.end();
      //   return;
      // }
      if(options.onWsClose){
        options.onWsClose(connectedNs, isNormal);
      }
      if(wsError){
        // webSocket 出错
        console.error('wsError', wsError);
        // connectedNs.destroy(wsError);
        // return;
      }

      // 1. 用户非正常退出, 比如关闭页面、浏览器。
      // 2. 断网了，客户端会无限重连, 未在指定时间内连接，
      //    则 net 服务端会自动退出并触发 logout。

      /* 
        以下跟本项目无关：
        user-server 后台运行的话：
        主server 和 term 进程意外退出，应关闭 net 服务器。
        主server：
          process.on('exit'), 会触发 ws 断开。
          'kill ' + process.pid 会触发 ws 断开。
          终端 kill:  会触发 ws 断开。
        term：
          term.on('close') 没有问题。
      */



      // connectedNs.write(JSON.stringify({
      //   type: 'webSocketClose',
      //   code: closeEvent.code,
      //   reason: closeEvent.reason
      // }));
      // 其它由ns 判定
  
    },

    error: function(){
      // https://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
      wsError = new Error('Websocket Error.');
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
    close: function(hadError){ // boolean

      ws.removeEventListener('close', wsHandles.close);

      if(hadError){
        if(nsError){
          ws.close(1011, nsError.message);
        } else {
          ws.close(1011);
        }
      } else {
        ws.close(1000);
      }
    },
    error: function(err){
      // https://nodejs.org/api/net.html#net_event_error_1
      // The 'close' event will be called directly following this event.
      // console.log('nsError', err)
      nsError = err;
    }
  }
  connectedNs.setEncoding('utf-8');
  Object.keys(wsHandles).forEach(key => {
    ws.addEventListener(key, wsHandles[key]);
  })
  Object.keys(nsHandles).forEach(key => {
    connectedNs.on(key, nsHandles[key]);
  })
  // ws.onopen = function(){ // Don't trigger
  //   console.log('ws.onopen');
  //   if(options.onWsOpen){
  //     options.onWsOpen(connectedNs);
  //   }
  //   //_console.log('ws on open')
  // }
}

module.exports = ws2ns;

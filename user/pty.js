
const url = require('url');
const WebSocket = require('ws');


const terminals = Object.create(null),
  logs = Object.create(null);

exports.terminals = terminals;
exports.logs = logs;

exports.createPtyServer = function( server ){
  const wss = new WebSocket.Server({ server });

  wss.on('connection', function connection(ws, req) {
    const parsed = url.parse(req.url, true);
    const pid = parsed.query.pid;
    // console.log('pid', parsed.query.pid);
    // ws.on('message', function incoming(message) {
    //   console.log('received: %s', message);
    // });


    var term = terminals[pid];
    console.log('Connected to terminal ' + term.pid);
    // console.log('logs[term.pid] ' + logs[term.pid]);
    ws.send(logs[term.pid]);

    function buffer(socket, timeout) {
      let s = '';
      let sender = null;
      return (data) => {
        s += data;
        if (!sender) {
          sender = setTimeout(() => {
            socket.send(s);
            s = '';
            sender = null;
          }, timeout);
        }
      };
    }
    const send = buffer(ws, 5);

    term.on('data', function(data) {
      try {
        send(data);
      } catch (ex) {
        // The WebSocket is not open, ignore
      }
    });
    ws.on('message', function(msg) {
      term.write(msg);
    });
    ws.on('close', function () {
      term.kill('SIGHUP'); // 'SIGHUP'
      console.log('Closed terminal ' + term.pid);
      // Clean things up
      delete terminals[term.pid];
      delete logs[term.pid];
    });

    term.on('exit', function() {
      console.log('term.on exit', arguments);
      term.kill();
      ws.close();
    });
  });


}

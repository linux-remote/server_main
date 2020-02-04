const sessionStoreClient = require('../session-sotre-client.js');
const SocketRequest = require('../../../socket-request/index.js');

const sr = new SocketRequest(sessionStoreClient);

module.exports = function(data, callback){
  sr.request(data, callback);
}

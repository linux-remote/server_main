// POST
const WS = global.WEB_SOCKET_SERVER;
function getClientById(id){
  return WS.clients.find(client => client.id === id)
}
function callback(req, res, next){
  console.log('req', req.hostname)
  res.send('ok');
}

module.exports = callback;
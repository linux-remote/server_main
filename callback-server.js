const express = require('express');
const bodyParser = require('body-parser');
const {execSync} = require('child_process');

const PORT_PATH = '/dev/shm/linux-remote-callback.sock'
const PORT = 'http://unix:' + PORT_PATH

execSync('rm -rf ' + PORT_PATH);


const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.post('*', function(req, res, next){
  const data = req.body;
  console.log('req.ip', req.hostname);
  res.send(data)
});

const server = app.listen(PORT_PATH);
server.on('listening', () => {
  console.log('callback server runing on ' + PORT_PATH);
  execSync('chmod 777 ' + PORT_PATH)
})

module.exports = PORT_PATH;

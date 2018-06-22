const express = require('express');
const bodyParser = require('body-parser');
const {execSync} = require('child_process');

const PORT_PATH = '/dev/shm/linux-remote-callback.sock'
const PORT = 'http://unix:' + PORT_PATH

execSync('rm -rf ' + PORT_PATH);


const app = express();

app.use(bodyParser.json());
app.post(function(req, res, next){
  const data = req.body;
  res.send(data)
});

app.listen(PORT_PATH);
console.log('callback server runing on ' + PORT_PATH);
module.exports = PORT_PATH;

const express = require('express');
const bodyParser = require('body-parser');
const {execSync} = require('child_process');

const PORT = process.env.PORT;
//const PORT = 'http://unix:' + PORT;

execSync('rm -rf -- ' + PORT);


const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.post('*', function(req, res, next){
  const data = req.body;
  console.log('req.ip', req.hostname);
  res.send(data)
});

const server = app.listen(PORT);
server.on('listening', () => {
  console.log('callback server runing on ' + PORT);
})

module.exports = PORT;

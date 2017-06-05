var request = require('request');

request.get('http://unix:/opt/linux-remote-data/tmp/u7Riay8sSOtFZokxq3OLuqmj69ER1-eb-dw.sock:/',
function(err, req, body){
  console.log(err, body);
});

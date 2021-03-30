
let id = 0;
let cbMap = Object.create(null);

function say(data, callback){
  if(callback){
    id = id + 1;
    cbMap[id] = callback;
    data.id = id;
  }
  process.send(data);
}

process.on('message', function(msgObj){
  const id = msgObj.id;
  if(!id){
    global.__handleProcessUnCbMsg__(msgObj);
    return;
  }
  let cb = cbMap[id];
  cb(msgObj);
  delete(cbMap[id]);
});


module.exports = say;
const CONF = global.CONF;
const sslSelfSigned = CONF.sslSelfSigned;
const fs = require('fs');
const path = require('path');

sslSelfSigned._indexData = sslSelfSigned._indexData || {CADownloadedCount: 1};

// post
exports.verify = function(req, res){
  if(req.body.key === sslSelfSigned.CACertFirstDownloadKey){
    res.apiOk('/downloadCACert/' + req.body.key);
  }else{
    res.apiError(3);
  }
}

exports.getStatus = function(req, res){
  res.apiOk(sslSelfSigned._indexData.CADownloadedCount);
}

//get, params :key
exports.download = function(req, res){
  var _indexData = sslSelfSigned._indexData;
  if(_indexData.CADownloadedCount === 1){
    return res.apiError(4);
  }

  if(req.params.key === sslSelfSigned.CACertFirstDownloadKey){
    res.download(CONF.ssl.caCertPath, function(){
      //需要检测是否为ROOT
      const indexPath = path.resolve(CONF.ssl.caCertPath, '../index.json');
      _indexData.CADownloadedCount = 1; //debug 0
      fs.writeFile(indexPath, JSON.stringify(_indexData), function(err){
        if(err){
          _indexData.CADownloadedCount = 0;
          return console.error('CACertFirstDownloadKey index.json update fail!', err);
        }

        console.log('CACertFirstDownloadKey already used');
      });
    });
  }else{
    res.apiError(3);
  }
}


// 本地开发启动。

var linuxRemote = require('./index');
linuxRemote({
  ssl: true,
  sslSelfSigned: {
    commonName: '192.168.56.101',
    CACertFirstDownloadKey: 'abc',
  }
});

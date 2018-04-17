
// 本地开发启动。
var linuxRemoteServer = require('./index');
linuxRemoteServer({
  ssl: false,
  sslSelfSigned: {
    commonName: '192.168.56.101',
    CACertFirstDownloadKey: 'abc',
  }
});

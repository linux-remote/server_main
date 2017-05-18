module.exports = {
  port: 3000,

  //safe
  ssl: true,
  sslSelfSigned: {
    commonName: '192.168.56.102',
    CA: null,
    caCertDownloadUrlKey: 'abcdefg.ca.crt',
  },
  
}
//    wss: 'self-signed',
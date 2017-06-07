module.exports = {
  port: 3000,
  ssl: true,
  sslSelfSigned: {
    commonName: '192.168.56.101',
    CA: null, // will auto create
    CACertFirstDownloadKey: 'abc',
  },

  sessionSecret : 'asdfskgfxcmxuwer.jsfdssfss',

  sshPort: 22,
  ttl: 60 * 1000
}

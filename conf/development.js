module.exports = {
  port: 3000,
  ssl: false,
  sslSelfSigned: {
    commonName: null,
    CA: null, // will auto create
    CACertFirstDownloadKey: 'abc',
  },
  sshPort: 22
}

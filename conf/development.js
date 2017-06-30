module.exports = {
  port: 3000,
  ssl: true,
  sslSelfSigned: {
    CA: null, // will auto create
    CACertFirstDownloadKey: 'abc',
  },
  sshPort: 22
}

const TMP_PATH = '/var/tmp/linux-remote'
const OBJ = {
  DATA_PATH: '/root/.linux-remote-data',
  TMP_PATH,
  SESS_PATH: TMP_PATH + '/session',
  DUSTBIN_PATH: TMP_PATH + '/dustbin'
}

module.exports = OBJ;

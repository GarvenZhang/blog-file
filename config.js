module.exports = {
  serverPort: 3001,
  imagePath: './server/upload',
  maxAge: 60 * 60 * 24 * 7,
  ACCESS_CONTROL_ALLOW_ORIGIN: '*',
  ACCESS_CONTROL_ALLOW_METHOD: 'GET, POST',
  ACCESS_CONTROL_ALLOW_HEADERS: '*',
  dbConfig: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '970226',
    database: 'myblog'
  },
  auth: {
    key: './server/auth/2_file.hellojm.cn.key',
    cert: './server/auth/1_file.hellojm.cn_bundle.crt',
    subToken01: '#$%^%djfaslkf#%&e@',
    subToken02: 'd2feijncn4g&&3ad##w'
  },
}

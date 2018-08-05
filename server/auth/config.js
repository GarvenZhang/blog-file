const ISDEV = process.env.NODE_ENV === 'development'

module.exports = {

  ISDEV,

  imagePath: './server/upload',
  maxAge: 60 * 60 * 24 * 7,
  ACCESS_CONTROL_ALLOW_ORIGIN: `${ISDEV ? 'http://admin.localhost.cn' : 'https://admin.hellojm.cn'}`,
  ACCESS_CONTROL_ALLOW_METHOD: 'GET, POST, OPTIONS',
  ACCESS_CONTROL_ALLOW_HEADERS: '*',
  dev: {
    devPort: 3001,
    serverPort: 3009
  },
  prod: {
    port: 3001
  },
  PROD_dbConfig: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'sz1997',
    database: 'myblog'
  },
  DEV_dbConfig: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '970226',
    database: 'myblog'
  },
  auth: {
    key: './2_file.hellojm.cn.key',
    cert: './1_file.hellojm.cn_bundle.crt',
    subToken01: '#$%^%djfaslkf#%&e@',
    subToken02: 'd2feijncn4g&&3ad##w'
  },
}

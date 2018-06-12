require('babel-polyfill')
require('babel-core/register')

/**
 * Module dependencies.
 */
const logger = require('koa-logger')
const serve = require('koa-static')
const koaBody = require('koa-body')
const Router = require('koa-router')
const Koa = require('koa')
const fs = require('fs')
const mysql = require('mysql2/promise')
const app = new Koa()
const path = require('path')
const https = require('https')

const config = require('./config.js')
const route = require('./server/routes/router')
const router = new Router()
const isDev = process.env.NODE_ENV === 'development'

// 获取static文件
const staticPath = path.resolve(__dirname, './dist')
app.use(serve(staticPath, {
  setHeaders: function (res, path, stats) {
    if (path === `${staticPath}/chatroom-login.js`) {
      res.setHeader('Content-Type', 'text/javascript;charset=gb2312')
    }
  }
}))

// 获取上传文件

// 改koa-static/index.js
// Line 42:
// let webpToOtherTypePath = ''
//
// if (/\.png|\.jpeg|\.jpg|\.webp/i.test(ctx.url)) {
//
//   const supportWebp = ctx.cookies.get('supportWebp')
//
//   if (!supportWebp) {
//     webpToOtherTypePath = ctx.url.substr(-5, 5)
//   }
//
// }
//
// done = await send(ctx, webpToOtherTypePath || ctx.path, opts)

const uploadPath = path.resolve(__dirname, './server/upload')
app.use(serve(uploadPath, {}))

// log requests
app.use(logger())

app.use(koaBody({ multipart: true }))

// mysql
global.connectionPool = mysql.createPool(config.dbConfig)

app.use(async function mysqlConnection (ctx, next) {
  try {
    ctx.state.db = global.db = await global.connectionPool.getConnection()
    ctx.state.db.connection.config.namePlaceholders = true
    await ctx.state.db.query('SET SESSION sql_mode = "TRADITIONAL"')
    await next()
    ctx.state.db.release()
  } catch (e) {
    if (ctx.state.db) {
      ctx.state.db.release()
    }
    throw e
  }
})

// 路由
app.use(route)
app.use(router.allowedMethods())

// listen

if (isDev) {

  module.exports = app.listen(config.serverPort, function (err) {
    err && console.log(err)
    console.log(`listening on port ${config.serverPort}`)
  })

} else {

  const httpsOptions = {
    key: fs.readFileSync(config.auth.key),
    cert: fs.readFileSync(config.auth.cert)
  }


// === 工作原理： === //
// === https://www.guokr.com/post/114121/ === //
// === https://cloud.tencent.com/developer/article/1005197 === //
// 1、浏览器发起往服务器的 443 端口发起请求，请求携带了浏览器支持的加密算法和哈希算法。
//
// 2、服务器收到请求，选择浏览器支持的加密算法和哈希算法。
//
// 3、服务器下将数字证书返回给浏览器，这里的数字证书可以是向某个可靠机构申请的，也可以是自制的。
//
// 4、浏览器进入数字证书认证环节，这一部分是浏览器内置的 TSL 完成的：
//
// 4.1 首先浏览器会从内置的证书列表中索引，找到服务器下发证书对应的机构，如果没有找到，此时就会提示用户该证书是不是由权威机构颁发，是不可信任的。如果查到了对应的机构，则取出该机构颁发的公钥。
// 4.2 用机构的证书公钥解密得到证书的内容和证书签名，内容包括网站的网址、网站的公钥、证书的有效期等。浏览器会先验证证书签名的合法性（验证过程类似上面 Bob 和 Susan 的通信）。签名通过后，浏览器验证证书记录的网址是否和当前网址是一致的，不一致会提示用户。如果网址一致会检查证书有效期，证书过期了也会提示用户。这些都通过认证时，浏览器就可以安全使用证书中的网站公钥了。
// 4.3 浏览器生成一个随机数 R，并使用网站公钥对 R 进行加密。
// 5、浏览器将加密的 R 传送给服务器。
//
// 6、服务器用自己的私钥解密得到 R。
//
// 7、服务器以 R 为密钥使用了对称加密算法加密网页内容并传输给浏览器。
//
// 8、浏览器以 R 为密钥使用之前约定好的解密算法获取网页内容。
  module.exports = https.createServer(httpsOptions, app.callback()).listen(config.serverPort, function (err) {
    err && console.log(err)
    console.log(`Listening at localhost: ${config.serverPort}`)
  })

}

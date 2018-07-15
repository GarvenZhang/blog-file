require('babel-polyfill')
require('babel-core/register')

/**
 * Module dependencies.
 */
const logger = require('koa-logger')
const serve = require('garven-koa-static')
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

// === 字符编码 === //
// === [补充: 计算机中数据最终以二进制值存储, 每个二进制位(bit)有0和1两种状态, 一字节 = 8位 = 2 ^ 8 = 256种状态, 即 00000000 到 11111111] === //
// === 1 ASCII 码: 规定了128个字符编码(有32个不能打印出来的控制符号)，其中只占用一个字节的后7位，第一位统一为0  === //
// === 2 非 ASCII 编码: 英语128个就够了但是其他国家的语言不够，因此规定0-127表示的符号是一样的，128-255表示的符号因国家而异，但类似汉语这些还是不够 === //
// === 3 Unicode编码: 将世界上所有符号纳入其中并赋予独一无二的编码，但只是一个符号集，只规定了符号的二进制代码，却没有规定如何存储，如英文是一个字符而汉子是两个字符，计算机无法区别 === //
// === 4 UTF-8: 可以使用1~4个字节表示一个符号，根据不同的符号而变化字节长度，是 Unicode 的实现方式之一 === //
// === 4.1 编码规则 === //
// === 4.1.a 对于单字节的符号，字节的第一位设为0，后面7位为这个符号的 Unicode 码。因此对于英语字母，UTF-8 编码和 ASCII 码是相同的 === //
// === 4.1.b 对于n字节的符号（n > 1），第一个字节的前n位都设为1，第n + 1位设为0，后面字节的前两位一律设为10。剩下的没有提及的二进制位，全部为这个符号的 Unicode 码 === //
/*
Unicode符号范围     |        UTF-8编码方式
(十六进制)        |              （二进制）
----------------------+---------------------------------------------
0000 0000-0000 007F | 0xxxxxxx
0000 0080-0000 07FF | 110xxxxx 10xxxxxx
0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
*/
// === 4.2 例子 === //
/*
a.严的 Unicode 是4E25（100111000100101），根据上表，可以发现4E25处在第三行的范围内（0000 0800 - 0000 FFFF），因此严的 UTF-8 编码需要三个字节，即格式是1110xxxx 10xxxxxx 10xxxxxx。
b.然后，从严的最后一个二进制位开始，依次从后向前填入格式中的x，多出的位补0。这样就得到了，严的 UTF-8 编码是11100100 10111000 10100101，转换成十六进制就是E4B8A5
*/
// === 5 Little endian 和 Big endian: === //
// === Unicode 规范定义，每一个文件的最前面分别加入一个表示编码顺序的字符，这个字符的名字叫做"零宽度非换行空格"（zero width no-break space），用FEFF表示。这正好是两个字节，而且FF比FE大1。第一个字节在前，就是"大头方式"（Big endian），第二个字节在前就是"小头方式"（Little endian） === //
// === 如果一个文本文件的头两个字节是FE FF，就表示该文件采用大头方式；如果头两个字节是FF FE，就表示该文件采用小头方式 === //

// 获取static文件
const staticPath = path.resolve(__dirname, './dist')
app.use(serve(staticPath, {
  setHeaders: function (res, path, stats) {
    // if (path === `${staticPath}/chatroom-login.js`) {
    //   res.setHeader('Content-Type', 'text/javascript;charset=gb2312')
    // }
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
global.connectionPool = mysql.createPool(isDev ? config.DEV_dbConfig : config.PROD_dbConfig)

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
  module.exports = app.listen(config.dev.serverPort, function (err) {
    err && console.log(err)
    console.log(`listening on port ${config.dev.serverPort}`)
  })
} else {
  module.exports = app.listen(config.prod.port, function (err) {
    err && console.log(err)
    console.log(`listening on port ${config.prod.port}`)
  })

  // const httpsOptions = {
  //   key: fs.readFileSync(config.auth.key),
  //   cert: fs.readFileSync(config.auth.cert)
  // }

// === https://www.guokr.com/post/114121/ === //
// === https://cloud.tencent.com/developer/article/1005197 === //
  
// === 传输安全: === //
// === 1 窃听: === //
/*

  浏览器   ---->   代理服务器   ----> 链路    ----> 服务器
              |      此过程都可修改明文内容   |

*/
// === 1.1 窃听过程: traceroute [url] 可以查看从浏览器到服务器都经过了哪些节点(IP + 响应时间), 通过anyproxy可以设置本地代理, 若是明文传输，则在代理中可以 查看 和 篡改 所有报文内容 === //
// === 2 原理: === //
// === 2.1 浏览器发起往服务器的 443 端口发起请求，请求携带了浏览器支持的加密算法和哈希算法 === //
// === 2.2 服务器收到请求，选择浏览器支持的加密算法和哈希算法。 === //
// === 2.3 服务器下将数字证书返回给浏览器，这里的数字证书可以是向某个可靠机构申请的，也可以是自制的 === //
// === 2.4 浏览器进入数字证书认证环节，这一部分是浏览器内置的 TSL 完成的 === //
// === 2.4.a 首先浏览器会从内置的证书列表中索引，找到服务器下发证书对应的机构，如果没有找到，此时就会提示用户该证书是不是由权威机构颁发，是不可信任的。如果查到了对应的机构，则取出该机构颁发的公钥 === //
// === 2.4.b 用机构的证书公钥解密得到证书的内容和证书签名，内容包括网站的网址、网站的公钥、证书的有效期等。浏览器会先验证证书签名的合法性。签名通过后，浏览器验证证书记录的网址是否和当前网址是一致的，不一致会提示用户。如果网址一致会检查证书有效期，证书过期了也会提示用户。这些都通过认证时，浏览器就可以安全使用证书中的网站公钥了 === //
// === 2.4.c 浏览器生成一个随机数 R，并使用网站公钥对 R 进行加密 === //
// === 2.5 浏览器将加密的 R 传送给服务器 === //
// === 2.6 服务器用自己的私钥解密得到 R === //
// === 2.7 服务器以 R 为密钥使用了对称加密算法加密网页内容并传输给浏览器 === //
// === 2.8 浏览器以 R 为密钥使用之前约定好的解密算法获取网页内容 === //
// === 3 查看: chrome tools -> security === //
// === 3.1 第一个是根证书机构, 负责颁发, 下面是中级证书机构, 是个代理, 负责注册, 可收费可不收费 === //
// === 3.2 电脑中(mac ->  钥匙串)可以修改证书是否瘦信任 === //
// === 4 代理: === //
  
//   module.exports = https.createServer(httpsOptions, app.callback()).listen(config.serverPort, function (err) {
//     err && console.log(err)
//     console.log(`Listening at localhost: ${config.serverPort}`)
//   })
}

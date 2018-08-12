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

const config = require('./server/auth/config.js')
const route = require('./server/routes/router')
const router = new Router()

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

// 改koa-static/index.jsx
// Line 42:
// let webpToOtherTypePath = ''
//
// if (/\.png|\.jpeg|\.jpg|\.webp/i.prod(ctx.url)) {
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
app.use(serve(uploadPath, {
  setHeaders: function (res, path, stats) {
    res.setHeader('Accept-Ranges', 'bytes')
  }
}))

// log requests
app.use(logger())

app.use(koaBody({ multipart: true }))

// mysql
global.connectionPool = mysql.createPool(config.ISDEV ? config.DEV_dbConfig : config.PROD_dbConfig)

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

if (config.ISDEV) {
  module.exports = app.listen(config.dev.serverPort, function (err) {
    if (err) {
      return console.error(err)
    }
    console.log(`listening on port ${config.dev.serverPort}`)
  })
} else {
  module.exports = app.listen(config.prod.port, function (err) {
    if (err) {
      return console.error(err)
    }
    console.log(`listening on port ${config.prod.port}`)
  })

}

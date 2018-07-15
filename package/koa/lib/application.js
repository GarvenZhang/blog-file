// === 严格模式: 防止以前版本的javascript的不严谨的语法，同时为新版本javascript做铺垫，es6已经默认是严格模式 === //
// === 1 声明: 'use strict;' 放脚本第一行表明整个js文件为严格模式，放函数体第一行表明整个函数为严格模式 === //
// === 2 变化: https://garvenzhang.github.io/2017/08/22/use-strict/ === //
/*

// 2.1 全局变量
name = 1 -> let name = 1

// 2.2 变量删除
var x; delete x ;
->
var o = Object.create(null, {'x': {
  value: 1,
  configurable: true
}});
delete o.x;

// 2.3 arguments不再追踪参数的变化

function f(a) {
  a = 2;
  return [a, arguments[0]];
}
f(1); // 正常模式为[2,2]

function f(a) {
  "use strict";
  a = 2;
  return [a, arguments[0]];
}
f(1); // 严格模式为[2,1]

// 2.4 禁止使用arguments.callee

// 2.5 函数必须声明在顶层
"use strict";
if (true) {
  function f() { } // 语法错误
}
for (var i = 0; i < 5; i++) {
  function f2() { } // 语法错误
}

*/

'use strict'

// === 源码解读技巧: === //
// === 1 一开始不要关注细节，先搞清楚结构，每个模块做了什么事情 === //
// === 2 不影响主要思路的先删掉，减轻不必要影响, 比如 debug，log，兼容性判断 === //
// === 3 改成自己习惯的代码风格 === //
// === 4 注释很重要 === //
// === 5 研究一个函数的时候，先看入参和返回值，再看中间的处理细节 === //

const onFinished = require('on-finished')
const response = require('./response')
const compose = require('koa-compose')
const isJSON = require('koa-is-json')
const context = require('./context')
const request = require('./request')
const statuses = require('statuses')
const Cookies = require('cookies')
const accepts = require('accepts')
const Emitter = require('events')
const assert = require('assert')
const Stream = require('stream')
const http = require('http')
const only = require('only')
const convert = require('koa-convert')

// === Application: 一个完整的http请求处理过程 -> 监听端口、创建上下文、使用中间件处理请求、响应请求 === //
/*


                                      ---> constructor
new Koa() --> Application[Emitter] -->
                                      ---> use
                                      ---> listen ---> callback
                                                                     ---> context
                                                   ---> createContext
                                      ---> callback                  ---> request/response
                                                                     ---> context.app/context.req ...

                                                                     ---> compose(middlewares)
                                                   ---> handleRequest
                                                                                  ---> buffer
                                                                     ---> response
                                                                                  ---> string
                                                                                  ---> stream
                                                                                  ---> json
*/



/**
 * Application继承Emitter类
 */
module.exports = class Application extends Emitter {

  constructor () {
    super()

    this.proxy = false
    this.middleware = []
    this.subdomainOffset = 2
    this.env = process.env.NODE_ENV || 'development'
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }

  /**
   * 监听
   */
  listen (...args) {
    const server = http.createServer(this.callback())
    return server.listen(...args)
  }

  /**
   * http服务器回调
   */
  callback () {

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx)
    }

    return handleRequest
  }

  /**
   * 创建上下文
   */
  createContext (req, res) {

    const context = Object.create(this.context)
    const request = context.request = Object.create(this.request)
    const response = context.response = Object.create(this.response)

    context.app = request.app = response.app = this
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request

    context.originalUrl = request.originalUrl = req.url
    context.cookies = new Cookies(req, res, {
      keys: this.keys,
      secure: request.secure
    })

    request.ip = request.ips[0] || req.socket.remoteAddress || ''

    context.accept = request.accept = accepts(req)
    context.state = {}

    return context
  }

  /**
   * 处理请求
   */
  handleRequest (ctx) {

    // 组合中间件
    const fn = compose(this.middleware)

    // 默认状态码404
    const res = ctx.res
    res.statusCode = 404

    const handleResponse = () => respond(ctx)

    onFinished(res, onerror)

    // 处理完中间件后就响应请求
    return fn(ctx).then(handleResponse)
  }

  /**
   * 使用中间件
   */
  use (fn) {
    this.middleware.push(fn)
    return this
  }

}

/**
 * 响应请求
 */
function respond (ctx) {
  // allow bypassing koa
  if (ctx.respond === false) return

  const res = ctx.res
  if (!ctx.writable) return

  let body = ctx.body
  const code = ctx.status

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null
    return res.end()
  }

  if (ctx.method == 'HEAD') {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body))
    }
    return res.end()
  }

  // status body
  if (body == null) {
    body = ctx.message || String(code)
    if (!res.headersSent) {
      ctx.type = 'text'
      ctx.length = Buffer.byteLength(body)
    }
    return res.end(body)
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body)
  if (typeof body === 'string') return res.end(body)
  if (body instanceof Stream) return body.pipe(res)

  // body: json
  body = JSON.stringify(body)
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body)
  }

  res.end(body)
}

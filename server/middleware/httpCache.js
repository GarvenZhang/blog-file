// === http缓存： === //

// === 1 强缓存: === //
// === 1.1 Expires[http1.0]: 绝对时间内缓存有效 === //
// === 1.2 Cache-Control[http1.1]: 优先级高于Expires === //
// === > max-age: 相对时间内缓存有效 === //
// === > s-maxage: 相对时间内有效，优先级高于max-age, 在public中有效 === //
// === > private: 只在用户浏览器中缓存 === //
// === > public: 允许代理服务器缓存 === //
// === > no-cache: 强制源服务器再次验证, 一般搭配max-age: 0 === //
// === > no-store: 不缓存 === //
// === 1.3 表现: 200(from memory cache / from disk memory) === //
// === 1.4 搭配 === //
/*
max-age: 3600, s-maxage: 36000
Last-Modified: xxx
Etag: xxx
*/
// === 1.4.1 流程:  === //
// === > max-age时间内去浏览器缓存中获取，返回200 === //
// === > max-age过期后s-maxage没过期则去代理服务器上取, 返304 === //
// === > s-maxage也过期了去源服务器上对比Last-Modified, 一致则在对比Etag, 还是一致则返回304 === //
// === > 否则返回200并修改相应响应头 === //

// === 2 协商缓存: === //
// === 2.1 Last-Modified/If-Modified-Since: 资源修改时间(s) === //
// === 2.1.a 原理: 当第一次请求的时候服务器给个Last-Modified标识放在响应头, 代表资源的修改时间, 以后每次请求时浏览器会带上If-Modified-Since标识在请求头, 当Cache-Control失效后, 浏览器会接收到此请求，并比较现在此资源的修改时间是否与If-Modified-Since一致，一致则表示浏览器缓存中的资源与此刻浏览器中的资源一致, 返回304, 浏览器继续从缓存中读取资源；否则，返回200，并把响应头中的Last-Modified改为最新的文件修改时间 === //
// === 2.1.b 缺点: === //
// === > 某些服务器不能获取精确的修改时间. 比如在1s内修改了 === //
// === > 文件时间修改了但内容没变 === //
// === 2.2 Etag/If-None-Match: 内容hash值, 优先级高于Last-Modified/If-Modified-Since === //
// === 3 触发行为：强缓存失效, 用户refresh、F5 === //
// === 4 表现: 304 === //

// === 3 200状态: === //
// === 3.1 触发行为: 无缓存(第一次请求或者no-store)、协商缓存失效、Ctrl + F5  === //
// === 3.2 避免行为：新开窗口输入url或者通过外链进入 === //

const fs = require('fs')
const path = require('path')
const config = require('../auth/config')

const imgCache = async (ctx, next) => {
  const maxAge = config.maxAge
  await fs.stat(path.resolve(__dirname, `.${ctx.url}`), function (err, stats) {
    if (err) {
      console.log(err)
    }
    // 304
    const ims = ctx.headers['if-modified-since']
    const mt = stats.mtime.getTime()
    if (new Date(ims) == new Date(mt)) {
      ctx.status = 304
      return
    }

    // 更新缓存相关字段
    ctx.set('Cache-Control', `max-age=${maxAge}, public`)
    ctx.set('Last-Modified', mt)
  })
}

module.exports = async function (ctx, next) {
  const ext = /(\.\w+?)$/.exec(ctx.url)[1]
  const absUrl = path.resolve(__dirname, `.${ctx.url}`)
  if (/\.(jpg|png|jpeg|gif|svg)$/.test(ext)) {
    await imgCache(ctx, next)
  }
  ctx.body = fs.createReadStream(absUrl)
  next()
}

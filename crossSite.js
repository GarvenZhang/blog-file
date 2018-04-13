const config = require('./config')

module.exports = async function (ctx, next) {
  if (ctx.method.toLowerCase() !== 'get' && ctx.url !== '/upload') {
    ctx.status = 403
    return
  }
  if (ctx.method.toLowerCase() !== 'post') {
    ctx.set('Access-Control-Allow-Origin', config.ACCESS_CONTROL_ALLOW_ORIGIN)
    ctx.set('Access-Control-Allow-Method', config.ACCESS_CONTROL_ALLOW_METHOD)
    ctx.set('Access-Control-Allow-Headers', config.ACCESS_CONTROL_ALLOW_HEADERS)
  }
  if (ctx.method.toLowerCase() === 'options') {
    ctx.status = 204
  }
  await next()
}

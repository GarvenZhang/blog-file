const dictionary = require('../db/dictionary')

exports.get = function (ctx) {
  const cb = ctx.query.cb
  ctx.set('Content-Type', 'application/javascript')
  ctx.body = `${cb}(${JSON.stringify(dictionary)})`
}


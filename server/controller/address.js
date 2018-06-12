const addressModel = require('../models/address')

exports.getAddress = function (ctx) {
  
  const cb = ctx.query.cb
  ctx.set('Content-Type', 'application/javascript')
  ctx.body = `${cb}(${JSON.stringify(addressModel.getAddress())})`

}

exports.getStreet = async function (ctx) {

  const {
    cb, id
  } = ctx.query

  ctx.set('Content-Type', 'application/javascript')

  const ret = await addressModel.getStreet(id)
  ctx.body = `${cb}(${JSON.stringify(ret.data)})`

}

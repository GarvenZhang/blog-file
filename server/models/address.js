const address = require('../db/address')
const sqlError = require('./modelError')

exports.getAddress = function () {
  return address
}

exports.getStreet = async function (id) {
  try {
    const sql = `SELECT * FROM Street WHERE id LIKE '${id}%';`
    const [data] = await global.db.execute(sql)

    return {
      retCode: 1,
      data,
      total_count: data.length
    }
  } catch (e) {
    sqlError(e)
  }
}

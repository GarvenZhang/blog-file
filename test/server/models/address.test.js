const mysql = require('mysql2/promise')

const addressModel = require('../../../server/models/address')
const config = require('../../../config')

describe('prod/models/address.test.js', function () {
  describe('addressModel.getStreet()', function () {
    beforeAll(async () => {
      global.connectionPool = mysql.createPool(config.dbConfig)
      global.db = await global.connectionPool.getConnection()
    })

    afterAll(() => {
      global.db.release()
    })

    test('"659002" contains "阿拉尔农场"', async () => {
      expect.assertions(1)

      const ret = await addressModel.getStreet('659002')
      const data = ret.data

      data.forEach(item => {
        if (item.text === '阿拉尔农场') {
          expect(item.text).toBe('阿拉尔农场')
        }
      })
    })

    test('"431227200" contains "步头降苗族乡"', async () => {
      expect.assertions(1)

      const ret = await addressModel.getStreet('431227')
      const data = ret.data

      data.forEach(item => {
        if (item.text === '步头降苗族乡') {
          expect(item.text).toBe('步头降苗族乡')
        }
      })
    })
  })
})

const request = require('supertest')

const config = require('../../../config')
const app = require('../../../app-fileServer')

describe('prod/controller/address.test.js', function () {
  describe('GET /address?cb=jsonp.getAddress', function () {
    let tmp = {}

    beforeAll(() => {
      global.jp = {}
      global.jp.getAddress = function (data) {
        tmp = data
      }
    })

    test('jsonp.getAddress() should be called', function (done) {
      request(app)
        .get('/address?cb=jp.getAddress')
        .expect('Content-Type', 'application/javascript')
        .expect(200)
        .end((err, res) => {
          err && console.log(err)
          eval(res.text)

          expect(tmp).toHaveProperty('province')
          expect(tmp).toHaveProperty('city')
          expect(tmp).toHaveProperty('district')

          done()
        })
    })
  })
})

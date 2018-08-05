const Router = require('koa-router')

const httpCache = require('../middleware/httpCache')
const crossSite = require('../middleware/crossSite')
const addressCtrl = require('../controller/address')
const dictionaryCtrl = require('../controller/dictionary')
const fileCtrl = require('../controller/file')

const router = new Router()

router.options('/img', crossSite)
router.post('/img', crossSite, fileCtrl.upload)

router.get('/address', addressCtrl.getAddress)

router.get('/street', addressCtrl.getStreet)

router.get('/dictionary', dictionaryCtrl.get)

module.exports = router.routes()

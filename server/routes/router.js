const Router = require('koa-router')

const httpCache = require('../middleware/httpCache')
const crossSite = require('../middleware/crossSite')
const addressCtrl = require('../controller/address')
const fileCtrl = require('../controller/file')

const router = new Router()

router.options('/upload', crossSite)
router.post('/upload', crossSite, fileCtrl.upload)

router.get('/address', addressCtrl.getAddress)

router.get('/street', addressCtrl.getStreet)

module.exports = router.routes()

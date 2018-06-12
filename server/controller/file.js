const fs = require('fs')
const path = require('path')
const webp = require('../middleware/webp')
const config = require('../../config')

exports.upload = async function (ctx) {

  // 文件上传
  const file = ctx.request.body.files.file
  const reader = fs.createReadStream(file.path)

  // 原图
  const outputPath = path.resolve(config.imagePath, file.name)
  let stream = fs.createWriteStream(outputPath)
  reader.pipe(stream)

  // 存多一份webp
  await webp.cwebp(file.path, path.resolve(config.imagePath, file.name) + '.webp', 80)
  ctx.status = 204
}

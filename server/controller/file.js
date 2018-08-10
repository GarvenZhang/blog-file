const fs = require('fs')
const path = require('path')
const webp = require('../middleware/webp')
const config = require('../auth/config')

exports.upload = async function (ctx) {
  
  // 文件上传
  const file = ctx.request.body.files.file
  
  if (!file) {
    ctx.status = 400
    ctx.body = {
      message: '无内容!'
    }
    return
  }

  // === 上传漏洞防御 - 限制上传后缀名 === //
  // === 上传漏洞防御 - 文件类型检查 === //
  const ext = path.extname(file.name)
  if (/^\.js$/.test(ext) || !config.IMAGE_MIME.includes(file.type)) {
    ctx.status = 406
    ctx.body = {
      message: '上传了非法文件!'
    }
    return
  }

  // === 上传漏洞防御 - 文件内容检查 === //
  const buf = fs.readFileSync(file.path)

  // png
  const isPng = config.PNG_SIGN.every((item, i) => buf[i] === item)
  const isWebp = config.WEBP_SIGN.every((item, i) => buf[i] === item)




  const reader = fs.createReadStream(file.path)

  // 原图
  const outputPath = path.resolve(config.imagePath, file.name)
  let stream = fs.createWriteStream(outputPath)
  reader.pipe(stream)

  // 存多一份webp
  if (path.extname(file.name) !== '.webp') {
    await webp.cwebp(file.path, path.resolve(config.imagePath, file.name) + '.webp', 80)
  }
  ctx.status = 204
}

// === 断点续传: 从文件已经下载的地方开始继续下载, 如vidio中可以通过 currentTime 特性控制 range === //
// === 1 状态码: === //
// === 1.1 206 Partial Content: 请求已成功，并且主体包含所请求的数据区间，该数据区间是在请求的 Range 首部指定的 === //
// === 1.2 416 Range Not Satisfiable: 服务器无法处理所请求的数据区间 === //
// === 2 请求头: === //
// === 2.1 Range: 告知服务器返回文件的哪一部分, 可以一次性请求多个部分，服务器会以 multipart 文件的形式将其返回。如果服务器返回的是范围响应，需要使用 206 状态码。假如所请求的范围不合法，那么服务器会返回 416 === //
// === 2.2 Accept-Ranges: 标识自身支持范围请求(partial requests), 字段的具体值用于定义范围请求的单位 === //
// === 2.3 Content-Range: 一个数据片段在整个文件中的位置 === //
// === 3 基本流程: === //
// === 3.1 浏览器请求内容 === //
// === 3.2 服务器告诉浏览器，该内容可以使用 Accept-Ranges 消息头进行分部分请求 === //
// === 3.3 浏览器重新发送请求，用 Range 消息头告诉服务器需要的内容范围 === //
// === 3.4 服务器会分如下两种情况响应浏览器的请求: === //
// === > 如果范围是合理的，服务器会返回所请求的部分内容，并带上 206 Partial Content 状态码. 当前内容的范围会在 Content-Range 消息头中申明 === //
// === > 如果范围是不可用的(例如，比内容的总字节数大), 服务器会返回 416 请求范围不合理 Requested Range Not Satisfiable 状态码. 可用的范围也会在 Content-Range 消息头中声明 === //
exports.resumeFromBP = async function (ctx) {

  const MIME = 'video/mp4'

  const url = path.resolve(__dirname, '../db', ctx.url)
  const stat = fs.statSync(url)
  const rangeObj = readRangeHeader(ctx.headers.range, stat.size)
  const {start, end} = rangeObj

  if (!rangeObj) {
    ctx.status = 404
    return
  }

  if (start > stat.size || end > stat.size) {
    ctx.status = 416
    ctx.set('Content-Range', 'bytes */' + stat.size)
    return
  }

  ctx.set('Content-Range', 'bytes ' + start + '-' + end + '/' + stat.size)
  ctx.status = 216

  const reader = fs.createReadStream(url, { start: start, end: end })
  reader.on('open', () => {
    reader.pipe(ctx.response)
  })


}

function readRangeHeader(range, totalLength) {
  /*
   * Example of the method 'split' with regular expression.
   *
   * Input: bytes=100-200
   * Output: [null, 100, 200, null]
   *
   * Input: bytes=-200
   * Output: [null, null, 200, null]
   */

  if (!range) {
    return
  }

  const array = range.split(/bytes=([0-9]*)-([0-9]*)/);
  const start = parseInt(array[1]);
  const end = parseInt(array[2]);
  const result = {
    Start: isNaN(start) ? 0 : start,
    End: isNaN(end) ? (totalLength - 1) : end
  };

  if (!isNaN(start) && isNaN(end)) {
    result.Start = start;
    result.End = totalLength - 1;
  }

  if (isNaN(start) && !isNaN(end)) {
    result.Start = totalLength - end;
    result.End = totalLength - 1;
  }

  return result;
}

// 改：imagemin/index.js
// Line 15  const dest = output
// Line 30  path: dest
const imagemin = require('imagemin')
const webp = require('imagemin-webp')

exports.cwebp = function (inputPath, outputFolder, quality) {

  return new Promise((resolve, reject) => {

    imagemin([inputPath], outputFolder, {

      plugins: [webp({
        quality
      })]

    })

    resolve()

  })

}



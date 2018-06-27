// === 虚拟代理: 把一些开销很大的对象，延迟到真正需要它的时候才去创建 === //
// === 1 实现: 图片预加载 === //
// === 1.1 先用占位图，等图片加载好再填充到img节点里 === //
// === 1.2 即便以后不需要预加载，则只需改成请求本体而不是请求代理对象即可 === //

/**
 * 本体
 * 单一职责原则，本体对象负责设置src
 * @return {Object}
 */
let myImage = (function () {

  let img = document.createElement('img')
  document.body.appendChild(img)

  return {
    setSrc: src => img.src = src
  }

})()

/**
 * 代理
 * 单一职责原则，代理对象负责图片预加载
 * @return {Object}
 */
let proxyImg = (function () {

  let img = new Image()
  img.onload = function () {
    myImage.setSrc(this.src)
  }

  return {
    setSrc: function (src) {
      myImage.setSrc('loading')
      img.src = src
    }
  }

}())

proxyImg.setSrc('真正要请求的图片src')

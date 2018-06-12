import $, { $s } from '../lib/$.js'
import getStyle from '../lib/style.js'
import { addClass, removeClass, replaceClass } from '../lib/className.js'
import { on } from '../lib/event.js'
import DragDrop from './Dragdrop.js'

// === 链式调用：每个方法尾部返回this实例 === //
// === 1.优点：方便，节省代码 === //
// === 2.缺点：需要有返回值的情况下不适合用 === //

/**
 * 弹窗父类
 * @param {Object} config - 参数对象
 * @param {String} [config.header] - 标题
 */
function Popup (config = {header: '', content: '', question: '', yesText: '', noText: ''}) {

  this.config = Object.assign({}, config)
  this.$wrap = null // 最外层
  this.$modalBg = null  // 背景层
  this.$modalBody = null  // 内容层
  this.$canvas = null // 画布
  this.$closeBtn = null // 按钮
  this.$dragArea = null // 拖放区

  // style
  this.$wrapStyle = `
    position: absolute;
    width: 500px;
    left: 50%;
    top: 50%;
    text-align: center;
    transform: scale(0.01);
  `
  this.$modalBgStyle = `
    position: relative;
  `

};

Popup.prototype = {

  // === 字面量的形式，会重写原型，所以要将constructor指回构造函数 === //
  constructor: Popup,

  // === 原型上的属性一改全改，constructor中的会实例化 === //
  default: {
    $dragAreaStyle: `
      position: absolute;
      top: 7px;
      width: 100%;
      cursor: default;
    `,
    $closeBtnStyle: `
      position: absolute;
      top: 7px;
      right: 10px;
      width: 20px;
      width: 20px;
      z-index: 10;
      cursor: default;
    `,
    $modalBodyStyle: `
      position:  absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `,
    $wrapClassName: 'gar-modalWrap',
    $wrapBgClassName: 'gar-modalBg',
    $modalBodyClassName: 'gar-modalBody',
    $styleInnerHTML: `
      .popup-open {
        animation: popupOpen .5s ease-in forwards;
      }
      .popup-close {
        animation: popupClose .5s ease-in forwards;
      }
      @keyframes popupOpen {
        0% {
          transform: translateX(0) scale(.01);
        }
        100% {
          transform: scale(1);
        }
      }
      @keyframes popupClose {
        0% {
          transform: scale(1);
        }
        99% {
          transform: scale(.01);
        }
        100% {
          transform: translateX(-999px) scale(0.01);
        }
      }
    `,
    noSupportTips: 'CANVAS IS NOT ALLOWED IN YOUR CURRENT BROWSER VERSION.PLEASE UPDATE YOUR BROWSER!'
  },

  /**
   * 生成 div.gar-modalBg 和 div.gar-modalBody
   * // === appendChild(): 尾部添加；若已存在，则移动到新位置 === //
   * // === insertBefore(newNode, referenceNode): 将newNode插入到referenceNode前面；若 referenceNode 为Null, 则等价于appendChild()=== //
   * // === documentFragment: 存在于内存中，不会导致重绘，可优化性能 === //
   */
  createBaseHtml: function () {
    let fragement = document.createDocumentFragment()

    let $wrap = document.createElement('div')
    $wrap.className = this.default.$wrapClassName

    // === chrome有个bug，若一开始不设置left, top值，则在第一次拖放时只能在视口顶部位置左右拖放 === //
    $wrap.style = this.$wrapStyle

    let $modalBg = document.createElement('div')
    $modalBg.className = this.default.$wrapBgClassName
    $modalBg.style = this.$modalBgStyle

    let $modalBody = document.createElement('div')
    $modalBody.className = this.default.$modalBodyClassName
    $modalBody.style = this.default.$modalBodyStyle

    $wrap.appendChild($modalBg)
    $wrap.insertBefore($modalBody, null)
    fragement.appendChild($wrap)

    document.body.appendChild(fragement)

    this.$wrap = $wrap
    this.$modalBg = $modalBg
    this.$modalBody = $modalBody

    return this
  },

  /**
   * 生成动画需要的内联样式
   */
  createKeyframes: function () {

    let $style = document.createElement('style')
    $style.innerHTML = this.default.$styleInnerHTML
    document.head.appendChild($style)

    return this

  },

  /**
   * 画标题栏
   * // === 生成text方法： === //
   * // === 1.document.createTextNode(): === //
   * // === 2.innerText: === //
   * // === 3.innerHTML: === //
   * // === 4.textContent: 比innerHTML性能更好，不会解析html，因此可避免xss === //
   */
  drawHeading: function () {
    
    this.canvasWidth = 500
    this.canvasHeight = Math.max(160, 44 + parseFloat(getStyle(this.$modalBody, 'height')) + 10)

    let fragement = document.createDocumentFragment()

    // create
    let $canvas = document.createElement('canvas')
    let $dragArea = document.createElement('div')
    let $closeBtn = document.createElement('a')

    // attr
    $canvas.setAttribute('width', this.canvasWidth)
    $canvas.setAttribute('height', this.canvasHeight)

    $dragArea.className = 'gar-dragArea'
    $dragArea.style = this.default.$dragAreaStyle
    $dragArea.setAttribute('gar-dragable', true)

    $closeBtn.style = this.default.$closeBtnStyle

    // append
    $canvas.appendChild(document.createTextNode(this.default.noSupportTips))
    $closeBtn.textContent = 'X'
    $dragArea.innerText = this.config.header

    // event
    on($closeBtn, 'click', this.close.bind(this), false)

    for (var nodeArr = [$canvas, $dragArea, $closeBtn], len = nodeArr.length; len--;) {
      fragement.appendChild(nodeArr[len])
    }

    this.$modalBg.appendChild(fragement)

    this.$canvas = $canvas
    this.$closeBtn = $closeBtn
    this.$dragArea = $dragArea

    return this

  },

  /**
   * canvas画背景
   */
  drawBg: function () {
    
    let canvas = $('canvas', this.$wrap)
    const canvasWidth = this.canvasWidth
    const canvasHeight = this.canvasHeight

    if (canvas.getContext) {

      let ctx = canvas.getContext('2d')

      ctx.fillStyle = 'rgba(0,0,0,.6)'

      // border
      ctx.beginPath()

      ctx.strokeStyle = 'rgb(44,170,42)'
      ctx.lineWidth = 2
      ctx.lineCap = 'square'

      ctx.moveTo(10, 1)
      ctx.lineTo(canvasWidth - 10, 1)
      ctx.lineTo(canvasWidth - 1, 10)
      ctx.lineTo(canvasWidth - 1, canvasHeight)
      ctx.lineTo(1, canvasHeight)
      ctx.lineTo(1, 10)
      ctx.closePath()
      ctx.stroke()

      // canvasModal's navBox
      ctx.beginPath()

      ctx.lineCap = 'square'

      ctx.moveTo(10, 5)
      ctx.lineTo(canvasWidth - 10, 5)
      ctx.lineTo(canvasWidth - 5, 10)
      ctx.lineTo(canvasWidth - 5, 30)
      ctx.lineTo(5, 30)
      ctx.lineTo(5, 10)
      ctx.lineTo(10, 5)

      ctx.moveTo(canvasWidth - 33, 5)
      ctx.lineTo(canvasWidth - 33, 30)

      ctx.closePath()
      ctx.fillStyle = '#004100'
      ctx.fill()
      ctx.stroke()

    }

    return this

  },

  /**
   * 主体内容接口
   */
  createBody: function () {},

  /**
   * 打开弹窗
   * @public
   */
  open: function () {

    replaceClass(this.$wrap, 'popup-open', 'popup-close')

    return this
  },

  /**
   * 移动弹窗
   */
  move: DragDrop.enable,

  /**
   * 关闭弹窗
   */
  close: function () {

    replaceClass(this.$wrap, 'popup-close', 'popup-open')

    return this
  },

  /**
   * 初始化接口
   * @param {Object} config - 参数对象
   */
  init: function (config) {}

}

export default Popup

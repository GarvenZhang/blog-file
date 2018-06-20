import Popup from './main.js'

// === 构造函数继承 - 通过在子类构造函数中，调用父类构造函数的call方法，改变其执行环境为子类构造函数 === //
// === 优点： === //
// === 1.可以传递参数给子类 === //
// === 缺点： === //
// === 1.只能继承父类构造函数中的属性和方法，无法继承其原型链上的方法，无法单独使用 === //

function Confirm (config) {
  Popup.call(this, config)
}

Confirm.prototype.createBody = function () {
  let fragement = document.createDocumentFragment()

  let $question = document.createElement('p')
  $question.textContent = this.config.question

  let $yesBtn = document.createElement('input')
  $yesBtn.type = 'button'
  $yesBtn.value = this.config.yesText
  $yesBtn.style.marginRight = '20px'

  let $noBtn = document.createElement('input')
  $noBtn.type = 'button'
  $noBtn.value = this.config.noText

  fragement.appendChild($question)
  fragement.appendChild($yesBtn)
  fragement.appendChild($noBtn)

  this.$modalBody.appendChild(fragement)

  return this
}

Confirm.prototype.init = function (config) {
  let popup = new Confirm(config)

  popup
    .createBaseHtml()
    .createKeyframes()
    .drawHeading()
    .drawBg()
    .move()
    .createBody()

  this.open = this.open.bind(popup)
}

export default Confirm

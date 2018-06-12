import Popup from './main.js'

// === 组合继承 === //
// === 缺点： === //
// === 1.重复调用：两次调用了父类构造函数，第一次是new Popup()给子类原型时，第二次是在子类构造函数中调用父类构造函数的call方法时 === //
// === 2.属性冗余：第一次new Popup()时，父类中的属性变成了undefined === //

function Confirm (config) {

  Popup.call(this, config)

}

Confirm.prototype = new Popup()
Confirm.prototype.constructor = Confirm

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

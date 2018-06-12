import Popup from './main.js'

// === 原型链继承： === //
// === 缺点： === //
// === 1.子类的构造函数指向了父类(构造函数由原型决定) === //
// === 2.原型上若有引用类型，则一改全改 - 比如父类存默认变量的default对象 === //
// === 3.若子类构造函数与父类有相同参数，无法传给子类 === //

function Alert (config) {

}

Alert.prototype = new Popup({
  header: '警 告',
  content: '有毒'
})

// === 缺点1的解决办法：手动指回来 === //
// Alert.prototype.constructor = Alert

Alert.prototype.createBody = function () {

  this.$modalBody.style = `
    position:  absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `

  let span = document.createElement('div')
  span.textContent = this.config.content
  this.$modalBody.appendChild(span)

  return this

}

Alert.prototype.init = function (config) {

}

let alert = new Alert({
  header: '???'
})

alert
  .createBaseHtml()
  .createKeyframes()
  .drawHeading()
  .drawBg()
  .move()
  .createBody()

alert.open = alert.open.bind(alert)

export default alert

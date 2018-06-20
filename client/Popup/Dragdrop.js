import { on, off, getEvent, getTarget } from '../lib/event.js'

// === 单例模式：保证一个类只有一个实例；对于拖放的细节一开始就被实例化，之后通过对外接口调用的永远是它 === //
// === 事件委托：利用事件冒泡将事件处理程序的调用委托给上级去做 === //

// === e.clientX / e.clientY: 鼠标点击时在可视区的水平和垂直坐标 === //
// === node.offsetLeft / node.offsetWidth: 物体在包含块(offsetParent)中的水平垂直坐标 === //

// === attribute 与 property 区别： === //
// === 1.attribute会映射到html属性；property由DOM对象定义，即js对象，因此性能上property会更快 === //
// === 2.公认的attribute与property有1:1映射关系，如id / title等，但有特殊值，如class在property中为className, style在property中为对象 === //
// === 3.自定义属性需要用attribute === //

// === 拖放思路：=== //
// === 1.mousedown时获取到鼠标点击处在物体中的水平垂直坐标; 在mousemove时，用鼠标在可视区中的 水平垂直坐标 减去 mounsedown时计算出的距离差，得到的才是物体的 left / top 值 === //
// === 2.将事件都挂载到document上，并通过e.type来判断事件类型；其中通过一个变量(dragging)来判断是否拖拽的区域是正确的 === //

let DragDrop = (function () {
  let dragging = null
  let diffX = 0
  let diffY = 0

  let handleEvent = function (e) {
    e = getEvent(e)
    let target = getTarget(e)
    let $wrap = this.$wrap

    switch (e.type) {
      case 'mousedown':

        if (target.getAttribute('gar-dragable')) {
          dragging = target
          diffX = e.clientX - $wrap.offsetLeft
          diffY = e.clientY - $wrap.offsetTop
        }
        break

      case 'mousemove':

        if (dragging !== null) {
          $wrap.style.left = (e.clientX - diffX) + 'px'
          $wrap.style.top = (e.clientY - diffY) + 'px'
        }
        break

      case 'mouseup':

        dragging = null
        break
    }
  }

  return {

    enable: function () {
      handleEvent = handleEvent.bind(this)

      on(document, 'mousedown', handleEvent)
      on(document, 'mousemove', handleEvent)
      on(document, 'mouseup', handleEvent)

      return this
    },

    disable: function () {
      handleEvent = handleEvent.bind(this)

      off(document, 'mousedown', handleEvent)
      off(document, 'mousemove', handleEvent)
      off(document, 'mouseup', handleEvent)

      return this
    }
  }
}())

export default DragDrop

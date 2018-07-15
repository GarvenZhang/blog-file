// === 惰性函数: 解决每次都要调用进行判断的问题，实质是重写函数 === //

/**
 * 绑定DOM事件
 * // === 兼容性： === //
 * // === 1.addEventListener: DOM2级 === //
 * // === 2.attachEvent: ie9及以下, 只支持冒泡 === //
 * // === 3.on: DOM0级，只支持冒泡 === //
 * @param {Node} ele - 节点
 * @param {String} type - 类型
 * @param {Function} handler - 事件处理程序
 * @param {Boolean} isBubble - isBubble
 */

let on = function (ele, type, handler, isBubble = false) {

  if (ele.addEventListener) {
    on = ele.addEventListener(type, handler, isBubble)
  } else if (ele.attachEvent) {
    on = ele.attachEvent(`on${type}`, handler)
  } else {
    on = ele[`on${type}`] = handler
  }

}

/**
 * 取消DOM绑定
 * // === 兼容性：DOM2级 - removeEventListener; IE9及以下 - detachEvent; DOM0 - onEvent = null === //
 * @param {Node} ele - 节点
 * @param {String} type - 类型
 * @param {Function} handler - 事件处理程序
 * @param {Boolean} isBubble - isBubble
 */

let off = function (ele, type, handler, isBubble) {

  if (ele.removeEventListener) {
    off = ele.addEventListener(type, handler, isBubble)
  } else if (ele.detachEvent) {
    off = ele.detachEvent(`on${type}`, handler)
  } else {
    off = ele[`on${type}`] = null
  }

}

export {
  on,
  off
}

/**
 * 获取事件对象
 * // === 兼容性：ie - window.event === //
 * @param {Object} e - 事件对象
 * @return {Object}
 */
export function getEvent (e) {
  return e || window.event
}

/**
 * 获取实际触发事件的目标元素
 * // === 区别：e.currentTarget - 永远是注册事件处理程序的元素 === //
 * @param {Object} e - 事件对象
 * @return {Object}
 */
export function getTarget (e) {
  return e.target || e.srcElement
}

/**
 * 阻止默认事件
 * // === 兼容性：ie - returnValue = true === //
 * @param {Object} e - 事件对象
 */
export function preventDefault (e) {
  return e.preventDefault ? e.preventDefault() : e.returnValue = true
}

/**
 * 阻止事件冒泡
 * // === 兼容性：ie - cancelBubble = true === //
 * // === 区别：stopImmediatePropagation - 若按顺序地添加了多个事件处理程序，某一个调用后，之后的事件处理程序都无效了 === //
 * @param {Object} e - 事件对象
 */
export function stopPropagation (e) {
  return e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true
}

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
export function on (ele, type, handler, isBubble = false) {
  if (ele.addEventListener) {
    ele.addEventListener(type, handler, isBubble)
  } else if (ele.attachEvent) {
    ele.attachEvent(`on${type}`, handler)
  } else {
    ele[`on${type}`] = handler
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
export function off (ele, type, handler, isBubble) {
  if (ele.removeEventListener) {
    ele.addEventListener(type, handler, isBubble)
  } else if (ele.detachEvent) {
    ele.detachEvent(`on${type}`, handler)
  } else {
    ele[`on${type}`] = null
  }
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
  if (e.preventDefault) {
    e.preventDefault()
  } else {
    e.returnValue = true
  }
}

/**
 * 阻止事件冒泡
 * // === 兼容性：ie - cancelBubble = true === //
 * // === 区别：stopImmediatePropagation - 若按顺序地添加了多个事件处理程序，某一个调用后，之后的事件处理程序都无效了 === //
 * @param {Object} e - 事件对象
 */
export function stopPropagation (e) {
  if (e.stopPropagation) {
    e.stopPropagation()
  } else {
    e.cancelBubble = true
  }
}

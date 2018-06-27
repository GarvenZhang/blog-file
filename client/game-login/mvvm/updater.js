// 更新时调用的函数
export default {

  /**
   * 更新text
   * @param {Node} node - 节点
   * @param {String} val - 值
   */
  textUpdater (node, val) {
    node.textContent = typeof val === 'undefined' ? '' : val
  },

  /**
   * 更新html
   * @param {Node} node - 节点
   * @param {String} val - 值
   */
  htmlUpdater (node, val) {
    node.innerHTML = typeof val === 'undefined' ? '' : val
  },

  /**
   * 更新class
   * @param {Node} node - 节点
   * @param {String} val - 值
   * @param {String} oldVal - 旧值
   */
  classUpdater (node, val, oldVal) {

    let className = node.className
    className = className.replace(oldVal, '')
      .replace(/\s$/, '')

    let space = className && String(val) ? ' ' : ''

    node.className = className + space + val

  },

  /**
   * 更新model
   * @param {Node} node - 节点
   * @param {String} val - 值
   */
  modelUpdater (node, val) {
    node.value = typeof val === 'undefined' ? '' : val
  }

}

import { setAttr } from './util.js'

// === 虚拟DOM: DOM操作很慢, js操作很快, 因此可以把节点的信息用js对象存储起来，比如一个DOM对应转化成js对象。应该有tagName, props, key, children等属性 === //
// === 1 render: 通过DOM操作将描述DOM的js对象放到真实DOM中 === //

/**
 * 计算后代元素数量
 * @param {Object} children - 子元素集合
 * @return {Number}
 * @private
 */
function _calcCount (children) {

  // 后代元素数量
  let count = 0

  children.forEach((child, i) => {

    // 若子元素是VElment对象，则证明有count属性，直接加上即可
    // 不然，则是文本节点
    child instanceof VElement ? count += child.count : children[i] = '' + child

    // 加上此次遍历的元素
    ++count

  })

  return count

}

/**
 * 创建虚拟DOM
 * @param {String} tagName 标签名
 * @param {Object} [props] 属性集合
 * @param {Array} children 子元素集合
 */
let VElement = function (tagName, props = {}, children = []) {

  // 保证只能通过如下方式调用：new VElement
  if (!(this instanceof VElement)) {
    return new VElement(tagName, props, children)
  }

  // 若没有传props，则props的位置为children
  if (Array.isArray(props)) {
    children = props
    props = {}
  }

  // 设置虚拟dom的相关属性
  this.tagName = tagName
  this.props = props
  this.children = children
  this.key = props ? props.key : void 0
  this.count = _calcCount(this.children)

}

/**
 * 根据虚拟dom创建真实dom
 * @return {Object}
 */
VElement.prototype.render = function () {

  // 创建标签
  let el = document.createElement(this.tagName)

  // 设置标签的属性
  const props = this.props

  for (const propName in props) {
    setAttr(el, propName, props[propName])
  }

  // 一次创建子节点的标签
  this.children.forEach(child => {

    // 如果子节点仍然为velement，则递归的创建子节点，否则直接创建文本类型节点
    const childEl = (child instanceof VElement) ? child.render() : document.createTextNode(child)
    el.appendChild(childEl)

  })

  return el
}

export default VElement

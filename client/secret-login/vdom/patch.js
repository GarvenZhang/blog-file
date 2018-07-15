import { setAttr } from './util.js'
/** *******************************patch*************************************/
// 用于记录两个虚拟dom之间差异的数据结构

// 每个节点有四种变动
let REPLACE = 0
let REORDER = 1
let PROPS = 2
let TEXT = 3

function patch (node, patches) {
  
  let walker = {
    index: 0
  }
  
  dfsWalk(node, walker, patches)
}

patch.REPLACE = REPLACE
patch.REORDER = REORDER
patch.PROPS = PROPS
patch.TEXT = TEXT

/**
 * 深度优先遍历dom结构
 * @param {Node} node - 节点
 * @param {Object} walker -
 * @param {Object} patches - 差异
 */
function dfsWalk (node, walker, patches) {
  
  // 从patches中拿出当前节点的差异
  let currentPatches = patches[walker.index]

  // 深度遍历子节点
  const len = node.childNodes ? node.childNodes.length : 0

  for (let i = 0; i < len; i++) {

    let child = node.childNodes[i]

    ++walker.index

    dfsWalk(child, walker, patches)

  }

  // 如果当前节点存在差异，进行DOM操作
  currentPatches && applyPatches(node, currentPatches)
}

/**
 * 根据差异修改DOM
 * @param {Node} node - 节点
 * @param {Object} currentPatches - 当前比较的差异
 */
function applyPatches (node, currentPatches) {

  currentPatches.forEach(currentPatch => {

    switch (currentPatch.type) {

      case REPLACE:
        // 替换节点
        let newNode = (typeof currentPatch.node === 'string') ? document.createTextNode(currentPatch.node) : currentPatch.node.render()
        node.parentNode.replaceChild(newNode, node)
        break

      case REORDER:
        reoderChildren(node, currentPatch.moves)
        break

      case PROPS:
        setProps(node, currentPatch.props)
        break

      case TEXT:
        node.textContent ? node.textContent = currentPatch.content : node.nodeValue = currentPatch.content
        break

      default:
        throw new Error('Unknow patch type ' + currentPatch.type)
    }

  })

}

/**
 * 重排子节点的顺序
 * @param {Node} node - 节点
 * @param {Array} moves - 移动的项
 */
function reoderChildren (node, moves) {

  // 获取子节点的childNodes的数组形式
  let staticNodeList = [...node.childNodes]

  // 获取到旧的DOM中的key及对应的顺序
  let maps = {}

  staticNodeList.forEach(node => {

    if (node.nodeType !== 1) {
      return
    }

    const key = node.getAttribute('key')
    key && (maps[key] = node)

  })

  moves.forEach(move => {

    const index = move.index

    // 变动类型为删除节点
    if (move.type === 0) {

      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index])
      }

      staticNodeList.splice(index, 1)

      return
    }

    let insertNode
    if (maps[move.item.key]) {
      insertNode = maps[move.item.key]
    } else if (typeof move.item === 'object') {
      insertNode = move.item.render()
    } else {
      insertNode = document.createTextNode(move.item)
    }

    staticNodeList.splice(index, 0, insertNode)
    node.insertBefore(insertNode, node.childNodes[index] || null)

  })
}

/**
 * 设置属性
 * @param {Node} node - 节点
 * @param {Object} props - 属性集合
 */
function setProps (node, props) {

  for (const key in props) {

    if (props[key] === void 0) {
      node.removeAttribute(key)

    } else {
      setAttr(node, key, props[key])
    }

  }

}

export default patch
